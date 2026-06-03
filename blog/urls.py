from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    post_list,
    post_detail_by_slug,
    initiate_payment,
    mpesa_callback,
    FeedbackViewSet,
    google_login,
)

router = DefaultRouter()
router.register(r"feedbacks", FeedbackViewSet, basename="feedback")


urlpatterns = [
    # Content Delivery
    path("posts/", post_list, name="post-list"),
    path("posts/<slug:slug>/", post_detail_by_slug, name="post-detail"),
    
    
    # Payment & Auth Gateways
    path("posts/<slug:slug>/pay/", initiate_payment, name="post-pay"),
    path("payments/mpesa/callback/", mpesa_callback, name="mpesa-callback"),
    path("google-login/", google_login, name="google-login"),
]

urlpatterns += router.urls