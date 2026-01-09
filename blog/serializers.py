# blog/serializers.py
from rest_framework import serializers
from .models import Post

# serializers.py
class PostSerializer(serializers.ModelSerializer):
    banner_image = serializers.ImageField(use_url=True)  # ensures full URL
    author = serializers.CharField(source='author.username')

    class Meta:
        model = Post
        fields = ['id', 'slug','title', 'content', 'author', 'created_at', 'category', 'banner_image', 'featured']
