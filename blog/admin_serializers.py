from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Post, PaymentTransaction, Feedback, AdminAuditLog, AdminProfile, PostAccess, PostComment


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
    
    remove_profile_picture = serializers.BooleanField(write_only=True, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = AdminProfile
        fields = ["username", "email", "first_name", "last_name", "bio", "phone", "profile_picture", "remove_profile_picture"]

    def update(self, instance, validated_data):
        # 1. Handle profile picture removal flag
        if validated_data.pop("remove_profile_picture", False):
            instance.profile_picture = None
            
        # Prevent empty or falsey file payloads from accidentally clearing an existing image
        if 'profile_picture' in validated_data and not validated_data['profile_picture']:
            validated_data.pop('profile_picture')
        
        # 2. BUG FIX: Extract dotted nested user data source dictionaries safely
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        user_fields_updated = False
        for field in ["email", "first_name", "last_name"]:
            if field in user_data:
                setattr(user, field, user_data[field])
                user_fields_updated = True
                
        if user_fields_updated:
            user.save()

        # 3. Securely update remaining fields on the profile instance itself
        return super().update(instance, validated_data)


# -----------------------------
# Request password reset (send email)
# -----------------------------
class AdminPasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Only permit active staff members to initiate password recovery flows
        if not User.objects.filter(email__iexact=value, is_staff=True, is_active=True).exists():
            raise serializers.ValidationError("No administrative account discovered matching this email address.")
        return value


# -----------------------------
# Reset password (after clicking link)
# -----------------------------
class AdminPasswordResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        new_pass = attrs.get("new_password")
        if new_pass != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "New password and confirmation password fields must match perfectly."})
        
        # SECURITY FIX: Enforce your settings.py AUTH_PASSWORD_VALIDATORS policies
        try:
            validate_password(new_pass)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
            
        return attrs


# -----------------------------
# Posts
# -----------------------------
class AdminPostSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_field="username")
    
    author_name = serializers.SerializerMethodField() 
    
    conversion_rate = serializers.SerializerMethodField()
    banner_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = "__all__" # Because this is __all__, custom_author and author_name will be included automatically!
        read_only_fields = ["author", "slug", "created_at", "updated_at", "views", "reading_time_minutes", "conversion_rate"]

    def update(self, instance, validated_data):
        if 'banner_image' in validated_data and not validated_data['banner_image']:
            validated_data.pop('banner_image')
        return super().update(instance, validated_data)
    
    def get_author_name(self, obj):
        # 1. If you typed a name in the override box, use it!
        if getattr(obj, 'custom_author', None):
            return obj.custom_author
            
        # 2. Otherwise, fall back to the Admin's real name or username
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
            
        return "Admin"

    def get_conversion_rate(self, obj):
        # ... (keep your existing conversion rate logic exactly the same) ...
        if getattr(obj, 'views', 0) == 0:
            return "0.0%"
        if hasattr(obj, 'successful_purchases'):
            purchases = obj.successful_purchases
        else:
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
        read_only_fields = fields


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
    admin_username = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = "__all__"
        read_only_fields = ["admin", "timestamp"]

# -----------------------------
# Admin PostComment
# -----------------------------
class AdminPostCommentSerializer(serializers.ModelSerializer):
    # Pull in the post title so your React table doesn't just show a generic Post ID
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_slug = serializers.CharField(source='post.slug', read_only=True)
    author_email = serializers.EmailField(source='user.email', read_only=True, default=None)

    class Meta:
        model = PostComment
        fields = [
            'id', 'post', 'post_title', 'post_slug', 'user', 'author_email', 
            'name', 'content', 'is_approved', 'created_at'
        ]