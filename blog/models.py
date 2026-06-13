import math
from io import BytesIO
import sys
from PIL import Image

from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.files.uploadedfile import InMemoryUploadedFile

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

    series_name = models.CharField(
        max_length=150, 
        blank=True, 
        null=True, 
        help_text="If this is part of a multi-part story, type the series name here (e.g., 'The Genesis Protocol')"
    )
    part_number = models.PositiveIntegerField(
        blank=True, 
        null=True, 
        help_text="The sequence number for this specific post (e.g., 1, 2, 3)"
    )
    
    custom_author = models.CharField(
        max_length=150, 
        blank=True, 
        null=True, 
        help_text="Optional: Use this to override the default admin author name for guest writers"
    )
    
    banner_image = models.ImageField(upload_to="banners/", blank=True, null=True)
    category = models.CharField(max_length=50, default="General")
    featured = models.BooleanField(default=False)
    
    # Draft system
    is_published = models.BooleanField(default=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)
    meta_description = models.CharField(max_length=160, blank=True)
    
    # Analytics fields
    views = models.PositiveIntegerField(default=0)
    reading_time_minutes = models.PositiveIntegerField(default=5)

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

        # 2. Featured Logic (Un-feature others if this one is featured)
        if self.featured:
            Post.objects.exclude(pk=self.pk).update(featured=False)

        # 3. Calculate Reading Time
        if self.content:
            word_count = len(self.content.split())
            self.reading_time_minutes = math.ceil(word_count / 200) or 1

        # 4. Cloud-Safe Image Optimization (Pre-Save)
        if self.banner_image and not self.pk:
            try:
                img = Image.open(self.banner_image)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                    
                if img.height > 1080 or img.width > 1920:
                    output_size = (1920, 1080)
                    img.thumbnail(output_size)
                    
                    output = BytesIO()
                    img.save(output, format='JPEG', quality=85, optimize=True)
                    output.seek(0)
                    
                    filename = f"{self.banner_image.name.split('.')[0]}.jpg"
                    self.banner_image = InMemoryUploadedFile(
                        output, 'ImageField', filename,
                        'image/jpeg', sys.getsizeof(output), None
                    )
            except Exception as e:
                print(f"Image optimization failed: {e}")

        # Always call super().save() LAST
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PostAccess(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Modern replacement for unique_together
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='unique_post_access')
        ]

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

    # Database Indexes added here to prevent M-Pesa webhook timeouts
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    mpesa_receipt = models.CharField(max_length=50, blank=True, null=True, db_index=True)

    result_code = models.IntegerField(blank=True, null=True)
    result_desc = models.CharField(max_length=255, blank=True)

    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="PENDING", db_index=True
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
        ("EXPORT", "Export"),
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
    
class PostComment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    # Link to the user if they are logged in via Google Auth
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    # Fallback name for guest commenters
    name = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    
    # Security: Set to False if the client wants to manually approve every comment
    is_approved = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # Newest comments show up first

    def __str__(self):
        author = self.name or (self.user.username if self.user else "Anonymous")
        return f"{author} on {self.post.title}"