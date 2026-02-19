from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
from PIL import Image  # Requires Pillow: pip install Pillow
import math
import os # Added os import

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(upload_to="admin_profiles/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.user.username


class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    excerpt = models.TextField(max_length=500)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    banner_image = models.ImageField(upload_to="banners/", blank=True, null=True)
    category = models.CharField(max_length=50, default="General")
    featured = models.BooleanField(default=False)
    # NEW: Draft system
    is_published = models.BooleanField(default=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)
    meta_description = models.CharField(max_length=160, blank=True)
    
    # NEW: Analytics fields
    views = models.PositiveIntegerField(default=0)
    reading_time_minutes = models.PositiveIntegerField(default=5)  # Stored for performance

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # 1. Slug Generation
        if not self.slug:
            base = slugify(self.title)
            slug = base
            i = 1
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        # 2. Featured Logic
        if self.featured:
            Post.objects.exclude(pk=self.pk).update(featured=False)

        # 3. Calculate Reading Time
        if self.content:
            word_count = len(self.content.split())
            self.reading_time_minutes = math.ceil(word_count / 200)  # Assuming 200 wpm

        super().save(*args, **kwargs)

        # 4. Image Optimization (Post-Save)
        if self.banner_image:
            try:
                img_path = self.banner_image.path
                if os.path.exists(img_path): # Check if file exists before processing
                    img = Image.open(img_path)
                    if img.height > 1080 or img.width > 1920:
                        output_size = (1920, 1080)
                        img.thumbnail(output_size)
                        img.save(img_path, quality=85, optimize=True)
            except Exception:
                pass  # Don't crash if image processing fails

    def __str__(self):
        return self.title


class PostAccess(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user")

    def __str__(self):
        return f"{self.user} → {self.post.title}"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    )

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    checkout_request_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_receipt = models.CharField(max_length=50, blank=True, null=True)

    result_code = models.IntegerField(blank=True, null=True)
    result_desc = models.CharField(max_length=255, blank=True)

    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="PENDING"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.phone} | {self.post.title} | {self.status}"


class Feedback(models.Model):
    name = models.CharField(max_length=50, default="Anonymous")
    email = models.EmailField(blank=True, null=True)
    rating = models.PositiveIntegerField(default=0)
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    # This field was missing in your original models.py but present in views.py
    secret_key = models.CharField(max_length=100, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.rating}★)"


class AdminAuditLog(models.Model):
    ACTION_CHOICES = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
        ("EXPORT", "Export"), # Added Export action
    ]

    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["action"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.admin.username} - {self.action}"