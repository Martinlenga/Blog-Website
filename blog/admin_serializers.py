from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, PaymentTransaction, Feedback, AdminAuditLog, AdminProfile, PostAccess


# -----------------------------
# Admin Profile
# -----------------------------
class AdminProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", required=False, allow_blank=True)
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    # Add this flag field to handle the picture deletion
    remove_profile_picture = serializers.BooleanField(write_only=True, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = AdminProfile
        fields = ["username", "email", "first_name", "last_name", "bio", "phone", "profile_picture", "remove_profile_picture"]

    def update(self, instance, validated_data):
        # 1. Handle profile picture removal
        if validated_data.pop("remove_profile_picture", False):
            instance.profile_picture = None
        
        # 2. Extract nested fields (email, first_name, last_name)
        # These were mapped using source="user.email" etc.
        user = instance.user
        user_fields = ["email", "first_name", "last_name"]
        
        for field in user_fields:
            if field in validated_data:
                setattr(user, field, validated_data.pop(field))
        user.save()

        # 3. Update the rest of the AdminProfile fields
        return super().update(instance, validated_data)



# -----------------------------
# Request password reset (send email)
# -----------------------------
class AdminPasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value, is_staff=True).exists():
            raise serializers.ValidationError("No admin account found with this email.")
        return value


# -----------------------------
# Reset password (after clicking link)
# -----------------------------
class AdminPasswordResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        if attrs.get("new_password") != attrs.get("confirm_password"):
            raise serializers.ValidationError("New password and confirmation do not match.")
        return attrs


# -----------------------------
# Posts
# -----------------------------
class AdminPostSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_field="username")
    conversion_rate = serializers.SerializerMethodField()
    
    # Explicitly allow banner_image to be a file upload
    banner_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["author", "slug", "created_at", "updated_at", "views", "reading_time_minutes", "conversion_rate"]

    def update(self, instance, validated_data):
        # Prevent "empty" file objects from overwriting existing images
        if 'banner_image' in validated_data and not validated_data['banner_image']:
            validated_data.pop('banner_image')
            
        return super().update(instance, validated_data)

    def get_conversion_rate(self, obj):
        # Prevent division by zero
        if obj.views == 0:
            return "0.0%"
        # Count successful payments for this post
        purchases = PaymentTransaction.objects.filter(post=obj, status="SUCCESS").count()
        rate = (purchases / obj.views) * 100
        return f"{rate:.1f}%"


class AdminPostAccessSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_category = serializers.CharField(source="post.category", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = PostAccess
        fields = ["id", "post", "post_title", "post_category", "user_email", "granted_at"]
        read_only_fields = fields  # everything read-only



# -----------------------------
# Payments
# -----------------------------
class AdminPaymentSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source="post.title", read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "post",
            "post_title",
            "phone",
            "amount",
            "status",
            "checkout_request_id",
            "mpesa_receipt",
            "result_code",
            "result_desc",
            "created_at",
        ]


# -----------------------------
# Feedback
# -----------------------------
class AdminFeedbackSerializer(serializers.ModelSerializer):
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
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

# -----------------------------
# Admin Audit Log
# -----------------------------
class AdminAuditLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(
        source="admin.username",
        read_only=True
    )

    class Meta:
        model = AdminAuditLog
        fields = "__all__"
        read_only_fields = ["admin", "timestamp"]