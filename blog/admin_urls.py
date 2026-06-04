from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

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
    AdminPostAccessViewSet,
    AdminCommentListView,
    AdminCommentDetailView,
    AdminCommentApproveView,
)
from .admin_auth import AdminLoginView, AdminLogoutView

# Using DefaultRouter for clean API root navigation during development
router = DefaultRouter()

# CRITICAL ROUTING ORDER: Keep longer, more specific subpaths registered BEFORE base resources
# to prevent Django's greedy regex engine from matching resource IDs prematurely.
router.register(r'posts/access', AdminPostAccessViewSet, basename='admin-post-access')
router.register(r"posts", AdminPostViewSet, basename="admin-posts")
router.register(r"payments", AdminPaymentViewSet, basename="admin-payments")
router.register(r"feedbacks", AdminFeedbackViewSet, basename="admin-feedbacks")
router.register(r"dashboard", AdminDashboardViewSet, basename="admin-dashboard")
router.register(r"audit-logs", AdminAuditLogViewSet, basename="admin-audit-logs")

# Explicitly defining application namespace routing
urlpatterns = [
    # SESSION & AUTHENTICATION ENDPOINTS
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path("logout/", AdminLogoutView.as_view(), name="admin-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    
    # PROFILE & ACCOUNT MANAGEMENT
    path("profile/", AdminProfileView.as_view(), name="admin-profile"),
    path("change-password/", AdminChangePasswordView.as_view(), name="admin-change-password"),
    
    # PASSWORD ACCOUNT RECOVERY FLOWS
    path("password-reset-request/", AdminPasswordResetRequestView.as_view(), name="admin-password-reset-request"),
    path("password-reset/", AdminPasswordResetView.as_view(), name="admin-password-reset"),
    
    # AUTOMATED ROUTER INJECTIONS (REST ViewSets)
    path("", include(router.urls)),

    # COMMENT MANAGEMENT
    path("comments/", AdminCommentListView.as_view(), name="admin-comments-list"),
    path("comments/<int:pk>/", AdminCommentDetailView.as_view(), name="admin-comments-detail"),
    path("comments/<int:pk>/approve/", AdminCommentApproveView.as_view(), name="admin-comments-approve"),
]