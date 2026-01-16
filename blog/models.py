# models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)

    excerpt = models.TextField(max_length=500)
    content = models.TextField()

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    banner_image = models.ImageField(upload_to="banners/", blank=True, null=True)
    category = models.CharField(max_length=50, default="General")
    featured = models.BooleanField(default=False)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)

    meta_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            i = 1
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug

        if self.featured:
            Post.objects.exclude(pk=self.pk).update(featured=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PostAccess(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "phone")

    def __str__(self):
        return f"{self.phone} → {self.post.title}"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    )

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    checkout_request_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_receipt = models.CharField(max_length=50, blank=True, null=True)

    result_code = models.IntegerField(blank=True, null=True)
    result_desc = models.CharField(max_length=255, blank=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.phone} | {self.post.title} | {self.status}"
