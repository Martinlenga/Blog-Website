from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    post_list,
    post_detail_by_slug,
    initiate_payment,
    mpesa_callback,
    FeedbackViewSet,
    google_login,
    PostCommentAPIView
)

router = DefaultRouter()
router.register(r"feedbacks", FeedbackViewSet, basename="feedback")


urlpatterns = [
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Content Delivery
    path("posts/", post_list, name="post-list"),
    path("posts/<slug:slug>/", post_detail_by_slug, name="post-detail"),
    
    
    # Payment & Auth Gateways
    path("posts/<slug:slug>/pay/", initiate_payment, name="post-pay"),
    path("payments/mpesa/callback/", mpesa_callback, name="mpesa-callback"),
    path("google-login/", google_login, name="google-login"),
    path('posts/<slug:slug>/comments/', PostCommentAPIView.as_view(), name='post-comments'),
]

urlpatterns += router.urls