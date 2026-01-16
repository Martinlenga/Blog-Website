import base64
import requests
from datetime import datetime
from django.conf import settings

def normalize_phone(phone: str | None):
    """
    Normalize Kenyan phone numbers to 254XXXXXXXXX format.
    Accepts:
    - Mobile numbers: 07XXXXXXXX or 7XXXXXXXX
    - Old numbers: 01XXXXXXXX or 1XXXXXXXX
    - Already in 254XXXXXXXXX
    Returns None if invalid.
    """
    if not phone:
        return None

    phone = phone.strip().lstrip("+")  # remove leading '+'

    # Mobile numbers starting with 07XXXXXXXX or 7XXXXXXXX
    if phone.startswith("07") and len(phone) == 10:
        return "254" + phone[1:]
    if phone.startswith("7") and len(phone) == 9:
        return "254" + phone

    # Old numbers starting with 01XXXXXXXX or 1XXXXXXXX
    if phone.startswith("01") and len(phone) == 10:
        return "254" + phone[1:]
    if phone.startswith("1") and len(phone) == 9:
        return "254" + phone

    # Already in 254XXXXXXXXX format
    if phone.startswith("254") and len(phone) == 12:
        return phone

    return None


def get_mpesa_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
        if settings.MPESA_ENV == "sandbox" \
        else "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    response = requests.get(
        url,
        auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET)
    )
    response.raise_for_status()
    return response.json()["access_token"]


def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    token = get_mpesa_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest" \
        if settings.MPESA_ENV == "sandbox" \
        else "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

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
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()
