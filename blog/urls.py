from django.urls import path
from .views import (
    post_list,
    post_detail_by_slug,
    initiate_payment,
    mpesa_callback,
    FeedbackViewSet,
)
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path("posts/", post_list),
    path("posts/<slug:slug>/", post_detail_by_slug),
    path("posts/<slug:slug>/pay/", initiate_payment),
    path("payments/mpesa/callback/", mpesa_callback),
]

router = DefaultRouter()
router.register(r"feedbacks", FeedbackViewSet, basename="feedback")
urlpatterns += router.urls
