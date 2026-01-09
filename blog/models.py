from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields
    banner_image = models.ImageField(upload_to='banners/', blank=True, null=True)
    category = models.CharField(max_length=50, default='General')
    featured = models.BooleanField(default=False)
    slug = models.SlugField(unique=True, blank=True)  # NEW slug field

    def save(self, *args, **kwargs):
        # Generate slug from title if not provided
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            # Ensure uniqueness
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Ensure ONLY one featured post exists
        if self.featured:
            Post.objects.filter(featured=True).exclude(pk=self.pk).update(featured=False)
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
