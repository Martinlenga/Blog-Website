"""
Django settings for blogsite project.
Optimized for Hybrid Local Testing & Live Production Deployments.
"""

from pathlib import Path
import os
from datetime import timedelta
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local environment profiles dynamically
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ----------------------------------------------------------------------
# 🔐 SYSTEM SECURITY ENFORCEMENTS
# ----------------------------------------------------------------------

# Read your SECRET_KEY from the system environment for safety
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-s+fbva3oqj6s#utp19_d5$5hfq_fo(ztq$^tu*$8colohz5jfz')

# Safely switches between True locally and False on the hosting platform
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

# Dynamically splits the comma-separated hosts provided by your environment
ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS", 
    "127.0.0.1,localhost,echoingly-uningrafted-deborah.ngrok-free.dev"
).split(",")

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog',
    'rest_framework',
    'corsheaders',
    'django_extensions',
    'django_filters',
    'django_daraja',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ----------------------------------------------------------------------
# 🌐 CROSS-ORIGIN RESOURCE SHARING (CORS) CONFIGURATION
# ----------------------------------------------------------------------

# Dynamically registers your authorized domains
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ithaguru.co.ke",
    "https://www.ithaguru.co.ke"
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-user-phone',
    'content-type',
    'authorization',
]

# Add this so Django trusts your HTTPS domain for POST requests
CSRF_TRUSTED_ORIGINS = [
    'https://ithaguru.co.ke', 
    'https://www.ithaguru.co.ke',
    'https://api.ithaguru.co.ke'
]

# ----------------------------------------------------------------------
# 🍪 COOKIE & SESSION PRIVACY POLICY
# ----------------------------------------------------------------------

# Automatically requires secure HTTPS transmission when running live
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# Relaxes or strictly binds cookies depending on infrastructure environment
SESSION_COOKIE_SAMESITE = 'Lax' if DEBUG else 'None'
CSRF_COOKIE_SAMESITE = 'Lax' if DEBUG else 'None'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
SECURE_SSL_REDIRECT = not DEBUG

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7  # 1 Week

SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"
X_FRAME_OPTIONS = 'ALLOWALL'

# ----------------------------------------------------------------------
# CORE ROUTING AND ARCHITECTURE
# ----------------------------------------------------------------------

ROOT_URLCONF = 'blogsite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'blogsite.wsgi.application'

# Database Engine Setup
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation policies
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Localization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Media files setup
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files handling
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # Required for deployment hosting collection

# ----------------------------------------------------------------------
# REST API AND SECURITY TOKENS
# ----------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Dynamic Environment Variables for Third-Party Gateways
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_ENV = os.getenv("MPESA_ENV", "sandbox")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")