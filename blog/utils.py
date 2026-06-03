import base64
import requests
import logging
from datetime import datetime

from django.conf import settings
from django.core.cache import cache
from requests.exceptions import HTTPError, RequestException

logger = logging.getLogger(__name__)

# --------------------------
# Phone Normalization
# --------------------------
def normalize_phone(phone: str | None) -> str | None:
    if not phone:
        return None
        
    phone = phone.strip().lstrip("+")
    
    # Ensure the remaining string is strictly numeric
    if not phone.isdigit():
        return None

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
# Get OAuth Token (Cached for Performance)
# --------------------------
def get_mpesa_token() -> str:
    # Check if a valid token already exists in memory
    cached_token = cache.get("mpesa_access_token")
    if cached_token:
        return cached_token

    url = (
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        if settings.MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    )
    
    try:
        response = requests.get(
            url,
            auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
            timeout=10 # Prevent hanging requests
        )
        response.raise_for_status()
        
        token = response.json()["access_token"]
        
        # Safaricom tokens expire in 3600 seconds (1 hour). 
        # We cache it for 3500 seconds (58 mins) to give a safe buffer.
        cache.set("mpesa_access_token", token, timeout=3500)
        
        return token
        
    except RequestException as e:
        logger.error(f"Failed to fetch M-Pesa Token: {str(e)}")
        raise

# --------------------------
# Initiate STK Push
# --------------------------
def initiate_stk_push(phone_number: str, amount: int, account_reference: str, transaction_desc: str) -> dict:
    token = get_mpesa_token()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    url = (
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        if settings.MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    )

    # Note: TransactionType is "CustomerPayBillOnline" for Paybills. 
    # If using a Till Number in production, this needs to be "CustomerBuyGoodsOnline" 
    # and PartyB becomes the Till Number.
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

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        
        logger.info(f"STK Push initiated successfully for {phone_number}")
        return response.json()
        
    except HTTPError as e:
        logger.error(f"STK Push HTTP Error: {response.status_code} - {response.text}")
        raise
    except RequestException as e:
        logger.error(f"STK Push Request Failed: {str(e)}")
        raise