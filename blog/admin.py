from django.contrib import admin
from .models import (
    Post,
    PostAccess,
    PaymentTransaction,
    Feedback,
    AdminProfile,
    AdminAuditLog,
)


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "phone")


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "featured", "price", "created_at")
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ("featured", "category")
    search_fields = ("title", "excerpt", "content")
    ordering = ("-created_at",)


@admin.register(PostAccess)
class PostAccessAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "granted_at")   # 👈 USER not phone
    search_fields = ("user__google_id", "post__title")
    list_filter = ("granted_at",)


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "phone",
        "post",
        "amount",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = (
        "user__google_id",
        "phone",
        "post__title",
        "mpesa_receipt",
    )
    ordering = ("-created_at",)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "is_approved", "created_at")
    list_filter = ("rating", "is_approved")
    search_fields = ("name", "comment")
    ordering = ("-created_at",)


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "admin",
        "action",
        "model_name",
        "object_id",
        "timestamp",
    )
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
