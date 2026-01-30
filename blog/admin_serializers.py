from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, PaymentTransaction, Feedback, AdminAuditLog, AdminProfile


# -----------------------------
# Admin Profile
# -----------------------------
class AdminProfileSerializer(serializers.ModelSerializer):
    # User fields
    username = serializers.CharField(source="user.username", read_only=False)
    email = serializers.EmailField(source="user.email", required=False)
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)

    class Meta:
        model = AdminProfile
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "phone",
            "profile_picture",
        ]

    def update(self, instance, validated_data):
        # Extract user data
        user_data = validated_data.pop("user", {})

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update AdminProfile fields
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
    author = serializers.SlugRelatedField(
        read_only=True,
        slug_field="username"
    )
    

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["author", "slug", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)


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

