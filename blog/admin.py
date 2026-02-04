from django.contrib import admin
from django.contrib.auth.models import User
from .models import (
    Post,
    PostAccess,
    PaymentTransaction,
    Feedback,
    AdminProfile,
    AdminAuditLog,
)


# =========================
# ADMIN PROFILE
# =========================
@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "user__email", "phone")


# =========================
# POSTS
# =========================
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "featured", "price", "created_at")
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ("featured", "category")
    search_fields = ("title", "excerpt", "content")
    ordering = ("-created_at",)


# =========================
# POST ACCESS (UNLOCKS)
# =========================
@admin.register(PostAccess)
class PostAccessAdmin(admin.ModelAdmin):
    list_display = ("user_email", "post", "granted_at")
    search_fields = ("user__email", "user__username", "post__title")
    list_filter = ("granted_at",)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"


# =========================
# PAYMENTS
# =========================
@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "user_email",
        "phone",
        "post",
        "amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "user__email",
        "user__username",
        "phone",
        "post__title",
        "mpesa_receipt",
    )
    ordering = ("-created_at",)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "User Email"


# =========================
# FEEDBACK
# =========================
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "is_approved", "created_at")
    list_filter = ("rating", "is_approved")
    search_fields = ("name", "comment")
    ordering = ("-created_at",)


# =========================
# ADMIN AUDIT LOGS
# =========================
@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ("admin", "action", "model_name", "object_id", "timestamp")
    list_filter = ("action", "model_name", "timestamp")
    search_fields = ("admin__username", "model_name", "details")
    readonly_fields = (
        "admin",
        "action",
        "model_name",
        "object_id",
        "details",
        "timestamp",
    )
    ordering = ("-timestamp",)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
