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

# Safely switches between True locally and False on the hosting platform
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

# Strict check for Secret Key to prevent accidental exposure via insecure fallbacks in production
if DEBUG:
    SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-s+fbva3oqj6s#utp19_d5$5hfq_fo(ztq$^tu*$8colohz5jfz')
else:
    SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

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
    'rest_framework_simplejwt.token_blacklist',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Optimized for efficient static file hosting
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

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ithaguru.co.ke', 
    'https://www.ithaguru.co.ke',
    'https://api.ithaguru.co.ke'
]

# ----------------------------------------------------------------------
# 🍪 COOKIE & SESSION PRIVACY POLICY
# ----------------------------------------------------------------------

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

SESSION_COOKIE_SAMESITE = 'Lax' if DEBUG else 'None'
CSRF_COOKIE_SAMESITE = 'Lax' if DEBUG else 'None'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
SECURE_SSL_REDIRECT = not DEBUG  # Enforce HTTPS redirection in production

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7  # 1 Week

SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"
X_FRAME_OPTIONS = 'DENY' if not DEBUG else 'ALLOWALL'  # Mitigate clickjacking in production

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

# ----------------------------------------------------------------------
# 🗄️ DATABASE ENGINE ARCHITECTURE
# ----------------------------------------------------------------------

# Uses local SQLite for development, configured for alternative engine injection via environmental variables
if os.getenv("DATABASE_URL"):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
    }
else:
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
TIME_ZONE = 'Africa/Nairobi'  # Aligned to your operational region for accurate payment/article logs
USE_I18N = True
USE_TZ = True

# Media files setup
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files handling
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ----------------------------------------------------------------------
# REST API AND SECURITY TOKENS
# ----------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
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

FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

# ----------------------------------------------------------------------
# 📧 APPLICATION SPECIFIC & SMTP CONFIGURATIONS
# ----------------------------------------------------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "webmaster@localhost")

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend' if not DEBUG else 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')