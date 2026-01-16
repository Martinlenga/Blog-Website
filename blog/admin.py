# admin.py
from django.contrib import admin
from .models import Post, PostAccess, PaymentTransaction


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "featured", "price", "created_at")
    prepopulated_fields = {"slug": ("title",)}
    list_filter = ("featured", "category")
    search_fields = ("title", "excerpt", "content")


@admin.register(PostAccess)
class PostAccessAdmin(admin.ModelAdmin):
    list_display = ("phone", "post", "granted_at")
    search_fields = ("phone", "post__title")


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("phone", "post", "amount", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("phone", "post__title", "mpesa_receipt")
