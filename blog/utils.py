import json
import base64
import requests
from datetime import datetime
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from .models import Post, PostAccess, PaymentTransaction

# --------------------------
# Phone normalization
# --------------------------
def normalize_phone(phone: str | None):
    if not phone:
        return None
    phone = phone.strip().lstrip("+")
    if phone.startswith("07") and len(phone) == 10:
        return "254" + phone[1:]
    if phone.startswith("7") and len(phone) == 9:
        return "254" + phone
    if phone.startswith("01") and len(phone) == 10:
        return "254" + phone[1:]
    if phone.startswith("1") and len(phone) == 9:
        return "254" + phone
    if phone.startswith("254") and len(phone) == 12:
        return phone
    return None

# --------------------------
# Get OAuth token
# --------------------------
def get_mpesa_token():
    url = (
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        if settings.MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    )
    response = requests.get(
        url,
        auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
    )
    print("Token Response:", response.status_code, response.text)  # DEBUG
    response.raise_for_status()
    return response.json()["access_token"]

# --------------------------
# STK Push
# --------------------------
def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    token = get_mpesa_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    url = (
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        if settings.MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    )

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    print("=== STK Push Payload ===")
    print(json.dumps(payload, indent=2))
    print("=======================")

    response = requests.post(url, json=payload, headers=headers)
    print("STK Response Status:", response.status_code)
    print("STK Response Body:", response.text)

    response.raise_for_status()
    return response.json()


