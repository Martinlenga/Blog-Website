from django.urls import path
from .views import (
    post_list,
    post_detail_by_slug,
    initiate_payment,
    mpesa_callback,
)

urlpatterns = [
    path("posts/", post_list),
    path("posts/<slug:slug>/", post_detail_by_slug),
    path("posts/<slug:slug>/pay/", initiate_payment),
    path("payments/mpesa/callback/", mpesa_callback),
]
