from rest_framework import serializers
from .models import Post, Feedback


class PublicPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)
    published_at = serializers.DateTimeField(source="created_at", format="%b %d, %Y")
    price = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    meta_description = serializers.CharField(read_only=True)
    content_preview = serializers.SerializerMethodField()


    class Meta:
        model = Post
        fields = [
            "id",
            "slug",
            "title",
            "excerpt",         
            "author_name",
            "published_at",
            "category",
            "banner_image",
            "featured",
            "price",
            "reading_time",
            "meta_description",
            "content_preview",
        ]

    def get_price(self, obj):
        return f"{obj.price:.2f}"

    def get_reading_time(self, obj):
        words = len(obj.content.split())
        minutes = max(1, round(words / 200))  # realistic
        return f"{minutes} min read"
    
    def get_content_preview(self, obj):
        return obj.content[:800]


class FullPostSerializer(PublicPostSerializer):
    content = serializers.CharField()

    class Meta(PublicPostSerializer.Meta):
        fields = PublicPostSerializer.Meta.fields + ["content"]


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
