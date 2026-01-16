# serializers.py
from rest_framework import serializers
from .models import Post


class PublicPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username")
    published_at = serializers.DateTimeField(source="created_at", format="%b %d, %Y")
    price = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "slug",
            "title",
            "excerpt",
            "content",
            "author_name",
            "published_at",
            "category",
            "banner_image",
            "featured",
            "price",
        ]

    def get_price(self, obj):
        return f"{obj.price:.2f}"


class FullPostSerializer(PublicPostSerializer):
    class Meta(PublicPostSerializer.Meta):
        fields = PublicPostSerializer.Meta.fields + ["content"]
