import json
import uuid
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import F

from google.oauth2 import id_token
from google.auth.transport import requests
from requests.exceptions import HTTPError

from .models import Post, PaymentTransaction, PostAccess, Feedback
from .serializers import PostDetailSerializer, FeedbackSerializer
from .utils import initiate_stk_push, normalize_phone

# --------------------------
# Google login
# --------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def google_login(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "No token provided"}, status=400)

    try:
        info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        return Response({"error": "Invalid Google token"}, status=400)

    email = info.get("email")
    name = info.get("name", "")

    if not email:
        return Response({"error": "No email from Google"}, status=400)

    user, created = User.objects.get_or_create(
        username=email,
        defaults={
            "email": email,
            "first_name": name.split(" ")[0],
            "last_name": " ".join(name.split(" ")[1:]),
        }
    )

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "email": user.email,
            "name": name,
        },
        "created": created,
    })


# --------------------------
# Post list (public)
# --------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
@authentication_classes([])
def post_list(request):
    # Only fetch the featured post if it is published
    featured = Post.objects.filter(featured=True, is_published=True).first()
    
    # Only fetch regular posts if they are published
    posts = Post.objects.filter(featured=False, is_published=True).order_by("-created_at")

    return Response({
        "featured": PostDetailSerializer(featured).data if featured else None,
        "posts": PostDetailSerializer(posts, many=True).data,
    })


# --------------------------
# Post detail (requires login)
# --------------------------
@api_view(["GET"])
@permission_classes([]) 
@authentication_classes([JWTAuthentication])
def post_detail_by_slug(request, slug):
    post = get_object_or_404(Post, slug=slug)

    # ⭐ SMART ANALYTICS: Prevent double counting
    # We use the user's session to track if they've seen this post recently.
    session_key = f"viewed_post_{post.id}"

    if not request.session.get(session_key, False):
        # Only increment if they haven't seen it in this session
        Post.objects.filter(pk=post.pk).update(views=F("views") + 1)
        post.refresh_from_db()
        
        # Mark as viewed in session (expires when browser closes)
        request.session[session_key] = True

    user = request.user
    is_authenticated = user.is_authenticated

    print("📌 Request user:", user, "Authenticated:", is_authenticated)

    serializer = PostDetailSerializer(post)
    data = serializer.data

    has_access = False
    pending_payment = False

    if is_authenticated:
        has_access = PostAccess.objects.filter(post=post, user=user).exists()
        pending_payment = PaymentTransaction.objects.filter(
            post=post, user=user, status="PENDING"
        ).exists()

    # Admin Override (Admins always see content)
    if is_authenticated and user.is_staff:
        has_access = True

    locked = not has_access

    data["locked"] = locked
    data["pending_payment"] = pending_payment

    if locked:
        data["content"] = None
    else:
        data["content"] = post.content

    return Response(data)

# --------------------------
# Unlock post
# --------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def unlock_post(request, slug):
    post = get_object_or_404(Post, slug=slug)
    print("🔓 Unlock request by user:", request.user)

    PostAccess.objects.get_or_create(user=request.user, post=post)

    serializer = PostDetailSerializer(post)
    data = serializer.data
    data["locked"] = False
    data["content"] = post.content

    return Response(data)


# --------------------------
# Initiate payment endpoint
# --------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def initiate_payment(request, slug):
    post = get_object_or_404(Post, slug=slug)
    user = request.user

    phone = normalize_phone(request.data.get("phone"))
    if not phone:
        return Response({"error": "Invalid phone"}, status=400)

    # Skip if already unlocked
    if PostAccess.objects.filter(post=post, user=user).exists():
        return Response({"paid": True})

    # Check pending payment
    existing_tx = PaymentTransaction.objects.filter(post=post, user=user, status="PENDING").first()
    if existing_tx:
        return Response({
            "message": "Payment already in progress",
            "tx_id": existing_tx.id,
        })

    # Create transaction
    tx = PaymentTransaction.objects.create(
        post=post,
        user=user,
        phone=phone,
        amount=post.price,
        status="PENDING"
    )

    try:
        res = initiate_stk_push(
            phone_number=phone,
            amount=int(post.price),
            account_reference=f"{post.title}",
            transaction_desc=f"Payment for {post.title}",
        )
    except HTTPError as e:
        tx.status = "FAILED"
        tx.result_desc = str(e)
        tx.save()
        return Response({"error": "STK push failed", "details": str(e)}, status=500)

    tx.checkout_request_id = res.get("CheckoutRequestID")
    tx.save()

    return Response({
        "message": "STK push sent",
        "tx_id": tx.id,
        "response": res,
        "paid": False
    })

# --------------------------
# Mpesa callback endpoint
# --------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def mpesa_callback(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
        stk = payload.get("Body", {}).get("stkCallback", {})

        checkout_id = stk.get("CheckoutRequestID")
        if not checkout_id:
            return JsonResponse({"status": "invalid_callback"})

        tx = PaymentTransaction.objects.filter(
            checkout_request_id=checkout_id
        ).select_related("post", "user").first()

        if not tx:
            return JsonResponse({"status": "not_found"})

        tx.result_code = stk.get("ResultCode")
        tx.result_desc = stk.get("ResultDesc")

        if tx.result_code != 0:
            tx.status = "FAILED"
            tx.save()
            return JsonResponse({"status": "failed"})

        metadata = stk.get("CallbackMetadata", {}).get("Item", [])
        tx.mpesa_receipt = next(
            (i.get("Value") for i in metadata if i.get("Name") == "MpesaReceiptNumber"),
            None
        )

        tx.status = "SUCCESS"
        tx.save()

        # Grant access
        PostAccess.objects.get_or_create(post=tx.post, user=tx.user)

        return JsonResponse({"status": "success"})
    except Exception as e:
        print("Callback Error:", e)
        return JsonResponse({"status": "error"})

# --------------------------
# Feedback
# --------------------------
class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    http_method_names = ["get", "post"]

    def get_queryset(self):
        return Feedback.objects.filter(is_approved=True).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["secret_key"] = uuid.uuid4().hex

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
