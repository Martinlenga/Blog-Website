from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .admin_views import (
    AdminPostViewSet,
    AdminPaymentViewSet,
    AdminFeedbackViewSet,
    AdminDashboardViewSet,
    AdminAuditLogViewSet,
    AdminProfileView,
    AdminChangePasswordView,
    AdminPasswordResetRequestView,
    AdminPasswordResetView,
)

from .admin_auth import AdminLoginView, AdminLogoutView


router = DefaultRouter()
router.register(r"posts", AdminPostViewSet, basename="admin-posts")
router.register(r"payments", AdminPaymentViewSet, basename="admin-payments")
router.register(r"feedbacks", AdminFeedbackViewSet, basename="admin-feedbacks")
router.register(r"dashboard", AdminDashboardViewSet, basename="admin-dashboard")
router.register(r"audit-logs", AdminAuditLogViewSet, basename="admin-audit-logs")


urlpatterns = [
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path("logout/", AdminLogoutView.as_view(), name="admin-logout"),
    path("profile/", AdminProfileView.as_view(), name="admin-profile"),
    path("change-password/", AdminChangePasswordView.as_view(), name="admin-change-password"),
    path("password-reset-request/", AdminPasswordResetRequestView.as_view(), name="admin-password-reset-request"),
    path("password-reset/", AdminPasswordResetView.as_view(), name="admin-password-reset"),
    path("", include(router.urls)),
]
