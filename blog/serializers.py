from rest_framework import serializers
from .models import Post, Feedback

# --------------------------
# Post detail serializer (single, includes full content)
# --------------------------
class PostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)
    published_at = serializers.DateTimeField(source="created_at", format="%b %d, %Y")
    price = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    meta_description = serializers.CharField(read_only=True)
    content_preview = serializers.SerializerMethodField()  # teaser only

    class Meta:
        model = Post
        fields = [
            "id",
            "slug",
            "title",
            "content",          # full content included
            "content_preview",  # teaser
            "author_name",
            "published_at",
            "category",
            "banner_image",
            "featured",
            "price",
            "reading_time",
            "meta_description",
        ]

    def get_content_preview(self, obj):
        return obj.excerpt  # teaser

    def get_price(self, obj):
        return f"{obj.price:.2f}"

    def get_reading_time(self, obj):
        words = len(obj.content.split())
        minutes = max(1, round(words / 200))
        return f"{minutes} min read"


# --------------------------
# Feedback serializer
# --------------------------
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "id",
            "name",
            "email",
            "rating",
            "comment",
            "created_at",
        ]
