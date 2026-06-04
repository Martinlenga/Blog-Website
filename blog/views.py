import json
import uuid
import logging
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import F

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from google.oauth2 import id_token
import requests
from google.auth.transport import requests as google_requests
from requests.exceptions import HTTPError

from .models import Post, PaymentTransaction, PostAccess, Feedback, PostComment
from .serializers import PostListSerializer, PostDetailSerializer, FeedbackSerializer, PostCommentSerializer
from .utils import initiate_stk_push, normalize_phone

from rest_framework.views import APIView

logger = logging.getLogger(__name__)
from rest_framework import permissions 

# --------------------------
# Google Login
# --------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def google_login(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

    # 🚀 THE MAGIC: Ask Google directly who this Access Token belongs to
    google_url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}"
    google_response = requests.get(google_url)
    
    if not google_response.ok:
        return Response({"error": "Invalid or expired Google token"}, status=status.HTTP_400_BAD_REQUEST)

    info = google_response.json()
    
    email = info.get("email")
    name = info.get("name", "")

    if not email:
        return Response({"error": "No email provided by Google"}, status=status.HTTP_400_BAD_REQUEST)

    # From here down, we just create the user and issue the JWT exactly like before
    user, created = User.objects.get_or_create(
        username=email,
        defaults={
            "email": email,
            "first_name": name.split(" ")[0] if name else "",
            "last_name": " ".join(name.split(" ")[1:]) if name else "",
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
# Post List (Public)
# --------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
@authentication_classes([])
def post_list(request):
    featured = Post.objects.filter(featured=True, is_published=True).first()
    posts = Post.objects.filter(featured=False, is_published=True).order_by("-created_at")

    return Response({
        # Use PostListSerializer here to protect your payload size and content!
        "featured": PostListSerializer(featured).data if featured else None,
        "posts": PostListSerializer(posts, many=True).data,
    })


# --------------------------
# Post Detail (Paywall Logic)
# --------------------------
@api_view(["GET"])
@permission_classes([]) 
@authentication_classes([JWTAuthentication])
def post_detail_by_slug(request, slug):
    post = get_object_or_404(Post, slug=slug, is_published=True)

    # ⭐ VIEW TRACKING:
    # Note: If your frontend does not send 'credentials: include' to pass session cookies 
    # alongside the JWT, request.session will reset every time. If view counts inflate artificially, 
    # switch this to track by request.META.get('REMOTE_ADDR') (User's IP) instead of session.
    session_key = f"viewed_post_{post.id}"
    if not request.session.get(session_key, False):
        Post.objects.filter(pk=post.pk).update(views=F("views") + 1)
        post.refresh_from_db()
        request.session[session_key] = True

    user = request.user
    is_authenticated = user.is_authenticated

    serializer = PostDetailSerializer(post)
    data = serializer.data

    has_access = False
    pending_payment = False

    if is_authenticated:
        has_access = PostAccess.objects.filter(post=post, user=user).exists()
        pending_payment = PaymentTransaction.objects.filter(
            post=post, user=user, status="PENDING"
        ).exists()

    # Admins bypass the paywall entirely
    if is_authenticated and user.is_staff:
        has_access = True

    locked = not has_access

    data["locked"] = locked
    data["pending_payment"] = pending_payment

    if locked:
        data["content"] = None  # Crucial: Strips the content before it leaves the server
    else:
        data["content"] = post.content

    return Response(data)


# -------------------------------------------------------------
# 🚨 SECURED: 'unlock_post' endpoint was removed. 
# Do not allow users to manually trigger PostAccess via API calls.
# -------------------------------------------------------------


# --------------------------
# Initiate Payment Endpoint
# --------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def initiate_payment(request, slug):
    post = get_object_or_404(Post, slug=slug)
    user = request.user

    phone = normalize_phone(request.data.get("phone"))
    if not phone:
        return Response({"error": "Invalid phone number format provided."}, status=status.HTTP_400_BAD_REQUEST)

    if PostAccess.objects.filter(post=post, user=user).exists():
        return Response({"paid": True})

    existing_tx = PaymentTransaction.objects.filter(post=post, user=user, status="PENDING").first()
    if existing_tx:
        return Response({
            "message": "Payment already in progress. Please check your phone.",
            "tx_id": existing_tx.id,
        })

    tx = PaymentTransaction.objects.create(
        post=post,
        user=user,
        phone=phone,
        amount=post.price,
        status="PENDING"
    )

    try:
        title_words = post.title.split()
        if len(title_words) >= 2:
            formatted_ref = f"{title_words[0].capitalize()}_{title_words[1].capitalize()}"
        else:
            formatted_ref = f"{post.title.capitalize()}"

        clean_reference = formatted_ref[:12].rstrip("_")

        res = initiate_stk_push(
            phone_number=phone,
            amount=int(post.price),
            account_reference=clean_reference,
            transaction_desc=f"Unlock {post.slug[:15]}",
        )
    except HTTPError as e:
        tx.status = "FAILED"
        tx.result_desc = str(e)
        tx.save()
        return Response({"error": "STK push failed to initiate.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    tx.checkout_request_id = res.get("CheckoutRequestID")
    tx.save()

    return Response({
        "message": "STK push sent successfully.",
        "tx_id": tx.id,
        "response": res,
        "paid": False
    })


# --------------------------
# M-Pesa Webhook Callback
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

        # Updating status to SUCCESS triggers your signals.py file.
        # The signal will automatically create the PostAccess record.
        tx.status = "SUCCESS"
        tx.save() 

        return JsonResponse({"status": "success"})
        
    except Exception as e:
        logger.error(f"Safaricom Callback Error: {str(e)}")
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


# --------------------------
# Post Comment
# --------------------------
class PostCommentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def get(self, request, slug):
        post = get_object_or_404(Post, slug=slug)
        comments = PostComment.objects.filter(post=post, is_approved=True)
        serializer = PostCommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        post = get_object_or_404(Post, slug=slug)
        content = request.data.get('content')

        if not content:
            return Response({"error": "Comment content is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 🚀 Because of IsAuthenticatedOrReadOnly, we are 100% guaranteed 
        # that request.user exists here. We no longer need request.data.get('name').
        comment = PostComment.objects.create(
            post=post,
            content=content,
            user=request.user 
        )
        
        serializer = PostCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)