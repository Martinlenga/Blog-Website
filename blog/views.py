# views.py
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Post, PaymentTransaction, PostAccess
from .serializers import PublicPostSerializer, FullPostSerializer
from .utils import initiate_stk_push, normalize_phone

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

    phone = normalize_phone(request.headers.get("X-USER-PHONE"))

    has_access = False
    if phone:
        has_access = PostAccess.objects.filter(post=post, phone=phone).exists()

    if has_access:
        data = FullPostSerializer(post).data
        data["locked"] = False
    else:
        data = PublicPostSerializer(post).data
        data["locked"] = True

    return Response(data)

@api_view(["POST"])
def initiate_payment(request, slug):
    post = get_object_or_404(Post, slug=slug)
    phone = normalize_phone(request.data.get("phone"))

    if not phone:
        return Response({"error": "Invalid phone number"}, status=400)

    if PostAccess.objects.filter(post=post, phone=phone).exists():
        return Response({"paid": True, "message": "Already unlocked"})

    PaymentTransaction.objects.filter(
        post=post, phone=phone, status="PENDING"
    ).delete()

    tx = PaymentTransaction.objects.create(
        post=post,
        phone=phone,
        amount=post.price
    )

    try:
        res = initiate_stk_push(
            phone_number=phone,
            amount=int(post.price),
            account_reference=f"POST-{post.id}",
            transaction_desc=f"Payment for {post.title}",
        )
        tx.checkout_request_id = res.get("CheckoutRequestID")
        tx.save()
    except Exception:
        tx.status = "FAILED"
        tx.save()
        return Response({"error": "Payment initiation failed"}, status=500)

    return Response({
        "message": "STK push sent",
        "checkout_request_id": tx.checkout_request_id,
        "amount": f"{post.price:.2f}",
    })

@api_view(["POST"])
def mpesa_callback(request):
    payload = json.loads(request.body.decode("utf-8"))
    stk = payload.get("Body", {}).get("stkCallback", {})

    checkout_id = stk.get("CheckoutRequestID")
    result_code = stk.get("ResultCode")
    result_desc = stk.get("ResultDesc")

    tx = PaymentTransaction.objects.filter(
        checkout_request_id=checkout_id
    ).first()

    if not tx:
        return JsonResponse({"status": "not_found"})

    tx.result_code = result_code
    tx.result_desc = result_desc

    if result_code != 0:
        tx.status = "FAILED"
        tx.save()
        return JsonResponse({"status": "failed"})

    metadata = stk.get("CallbackMetadata", {}).get("Item", [])
    receipt = next(
        (i["Value"] for i in metadata if i["Name"] == "MpesaReceiptNumber"),
        None
    )

    tx.mpesa_receipt = receipt
    tx.status = "SUCCESS"
    tx.save()

    PostAccess.objects.get_or_create(
        post=tx.post,
        phone=tx.phone
    )

    return JsonResponse({"status": "success"})
