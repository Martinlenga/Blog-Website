from rest_framework import serializers
from .models import Post, Feedback, PostComment

# ---------------------------------------------------------
# Post List Serializer (Strictly Teasers - NO CONTENT LEAK)
# ---------------------------------------------------------
class PostListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
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
            "series_name", 
            "part_number",
        ]

    def get_author_name(self, obj):
        if getattr(obj, 'custom_author', None):
            return obj.custom_author
            
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
            
        return "JK Team"

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

# ---------------------------------------------------------
# PostComment Serializer
# ---------------------------------------------------------
class PostCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = PostComment
        fields = ['id', 'author_name', 'author_avatar', 'content', 'created_at']

    def get_author_name(self, obj):
        # 🚀 STRICT LOOKUP: Pull directly from the Google Auth User data.
        # (We keep the obj.name fallback at the very end ONLY so your React frontend 
        # doesn't crash if you have old, legacy anonymous comments already in the database)
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return obj.name or "Anonymous"

    def get_author_avatar(self, obj):
        name = self.get_author_name(obj)
        return f"https://ui-avatars.com/api/?name={name}&background=e0e7ff&color=4338ca"