from django.urls import path
from .views import (
    post_list,
    post_detail_by_slug,
    initiate_payment,
    mpesa_callback,
    FeedbackViewSet,
    google_login,
    unlock_post,
)
from rest_framework.routers import DefaultRouter

# --------------------------
# API endpoints
# --------------------------
urlpatterns = [
    path("posts/", post_list, name="post-list"),
    path("posts/<slug:slug>/", post_detail_by_slug, name="post-detail"),
    path("posts/<slug:slug>/unlock/", unlock_post, name="post-unlock"),
    path("posts/<slug:slug>/pay/", initiate_payment, name="post-pay"),
    path("payments/mpesa/callback/", mpesa_callback, name="mpesa-callback"),
    path("google-login/", google_login, name="google-login"),
]

# Feedback router
router = DefaultRouter()
router.register(r"feedbacks", FeedbackViewSet, basename="feedback")
urlpatterns += router.urls
