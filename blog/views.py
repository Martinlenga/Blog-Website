import json
import uuid
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import Post, PaymentTransaction, PostAccess, Feedback, GoogleUser
from .serializers import PublicPostSerializer, FullPostSerializer, FeedbackSerializer
from .utils import initiate_stk_push, normalize_phone

from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests

@api_view(["POST"])
def google_login(request):
    token = request.data.get("token")

    try:
        info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except Exception:
        return Response({"error": "Invalid Google token"}, status=400)

    user, _ = GoogleUser.objects.get_or_create(
        google_id=info["sub"],
        defaults={
            "email": info.get("email"),
            "name": info.get("name"),
        },
    )

    return Response({
        "google_id": user.google_id,
        "email": user.email,
        "name": user.name,
    })



@api_view(["GET"])
def post_list(request):
    featured = Post.objects.filter(featured=True).first()
    posts = Post.objects.filter(featured=False).order_by("-created_at")
    return Response({
        "featured": PublicPostSerializer(featured).data if featured else None,
        "posts": PublicPostSerializer(posts, many=True).data,
    })


@api_view(["GET"])
def post_detail_by_slug(request, slug):
    post = get_object_or_404(Post, slug=slug)

    google_id = request.headers.get("X-GOOGLE-ID")
    has_access = False

    if google_id:
        has_access = PostAccess.objects.filter(
            post=post,
            user__google_id=google_id
        ).exists()

    serializer = FullPostSerializer if has_access else PublicPostSerializer
    data = serializer(post).data
    data["locked"] = not has_access

    return Response(data)



@api_view(["POST"])
def initiate_payment(request, slug):
    post = get_object_or_404(Post, slug=slug)

    google_id = request.data.get("google_id")
    phone = normalize_phone(request.data.get("phone"))

    if not google_id:
        return Response({"error": "Google login required"}, status=401)

    user = get_object_or_404(GoogleUser, google_id=google_id)

    if PostAccess.objects.filter(post=post, user=user).exists():
        return Response({"paid": True})

    tx = PaymentTransaction.objects.create(
        post=post,
        user=user,
        phone=phone,
        amount=post.price,
    )

    res = initiate_stk_push(
        phone_number=phone,
        amount=int(post.price),
        account_reference=f"POST-{post.id}",
        transaction_desc=f"Payment for {post.title}",
    )

    tx.checkout_request_id = res.get("CheckoutRequestID")
    tx.save()

    return Response({"message": "STK push sent"})



@api_view(["POST"])
def mpesa_callback(request):
    payload = json.loads(request.body.decode("utf-8"))
    stk = payload.get("Body", {}).get("stkCallback", {})

    tx = PaymentTransaction.objects.filter(
        checkout_request_id=stk.get("CheckoutRequestID")
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
        (i["Value"] for i in metadata if i["Name"] == "MpesaReceiptNumber"),
        None
    )

    tx.status = "SUCCESS"
    tx.save()

    PostAccess.objects.get_or_create(
        post=tx.post,
        user=tx.user
    )

    return JsonResponse({"status": "success"})

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
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
