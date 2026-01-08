from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields
    banner_image = models.ImageField(upload_to='banners/', blank=True, null=True)
    category = models.CharField(max_length=50, default='General')
    featured = models.BooleanField(default=False)

    def __str__(self):
        return self.title
