from rest_framework import serializers
from .models import Post, Feedback

# ---------------------------------------------------------
# Post List Serializer (Strictly Teasers - NO CONTENT LEAK)
# ---------------------------------------------------------
class PostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)
    published_at = serializers.DateTimeField(source="created_at", format="%b %d, %Y")
    price = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    content_preview = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "slug",
            "title",
            "content_preview", 
            "author_name",
            "published_at",
            "category",
            "banner_image",
            "featured",
            "price",
            "reading_time",
            "views",
        ]

    def get_content_preview(self, obj):
        return obj.excerpt

    def get_price(self, obj):
        return f"{obj.price:.2f}"

    def get_reading_time(self, obj):
        minutes = obj.reading_time_minutes or 1
        return f"{minutes} min read"


# ---------------------------------------------------------
# Post Detail Serializer (Includes Gated Content)
# ---------------------------------------------------------
class PostDetailSerializer(PostListSerializer):
    """
    Inherits all formatting from PostListSerializer, but appends 
    the heavy/gated fields needed only for the single-article view.
    """
    meta_description = serializers.CharField(read_only=True)

    class Meta(PostListSerializer.Meta):
        # Dynamically adds 'content' and 'meta_description' to the base list
        fields = PostListSerializer.Meta.fields + ["content", "meta_description"]


# ---------------------------------------------------------
# Feedback Serializer
# ---------------------------------------------------------
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "id",
            "name",
            "email",
            "rating",
            "comment",
            "is_approved",
            "created_at",
        ]
        # 🚨 SECURITY FIX: Prevents public API from leaking customer emails to scrapers
        extra_kwargs = {
            'email': {'write_only': True}
        }