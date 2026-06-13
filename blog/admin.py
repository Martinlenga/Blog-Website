from django.contrib import admin
from django.contrib.auth.models import User
from .models import (
    Post,
    PostAccess,
    PaymentTransaction,
    Feedback,
    AdminProfile,
    AdminAuditLog,
    PostComment
)

# =========================
# ADMIN PROFILE
# =========================
@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "user__email", "phone")
    list_select_related = ("user",)  # Performance optimization


# =========================
# POSTS
# =========================
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "series_name", "part_number", "featured", "is_published", "price", "views", "reading_time_minutes", "created_at")
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ("series_name", "featured", "is_published", "category", "created_at")
    search_fields = ("title", "series_name", "excerpt", "content", "author__username")
    ordering = ("-created_at",)
    readonly_fields = ("views", "reading_time_minutes", "created_at", "updated_at")
    list_select_related = ("author",)


# =========================
# POST ACCESS (UNLOCKS)
# =========================
@admin.register(PostAccess)
class PostAccessAdmin(admin.ModelAdmin):
    list_display = ("get_user_email", "post", "granted_at")
    search_fields = ("user__email", "user__username", "post__title")
    list_filter = ("granted_at",)
    
    # Crucial for performance: Fetches User and Post in a single SQL JOIN
    list_select_related = ("user", "post")

    @admin.display(ordering="user__email", description="User Email")
    def get_user_email(self, obj):
        return obj.user.email


# =========================
# PAYMENTS
# =========================
@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "get_user_email",
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
    
    # Crucial for performance: Fetches User and Post in a single SQL JOIN
    list_select_related = ("user", "post")

    @admin.display(ordering="user__email", description="User Email")
    def get_user_email(self, obj):
        return obj.user.email


# =========================
# FEEDBACK
# =========================
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "is_approved", "created_at")
    list_filter = ("rating", "is_approved")
    search_fields = ("name", "comment", "email")
    ordering = ("-created_at",)


# =========================
# ADMIN AUDIT LOGS
# =========================
@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ("admin", "action", "model_name", "object_id", "timestamp")
    list_filter = ("action", "model_name", "timestamp")
    search_fields = ("admin__username", "model_name", "details")
    list_select_related = ("admin",)
    
    readonly_fields = (
        "admin",
        "action",
        "model_name",
        "object_id",
        "details",
        "timestamp",
    )
    ordering = ("-timestamp",)

    # -------------------------------------------------------------
    # STRICT IMMUTABILITY ENFORCEMENT
    # -------------------------------------------------------------
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        # 🚨 Prevents admins from altering existing log entries
        return False

    def has_delete_permission(self, request, obj=None):
        return False
    
# =========================
# POST COMMENTS
# =========================
@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ("name", "post", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("name", "content", "post__title", "user__email")
    ordering = ("-created_at",)
    
    # 🚀 Crucial for performance: Prevents N+1 queries by fetching the related Post and User in one go
    list_select_related = ("post", "user")