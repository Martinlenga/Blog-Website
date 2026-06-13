import csv
import codecs
from datetime import timedelta

from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncYear, TruncDate, TruncWeek
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet, ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .permissions import IsActiveAdminUser
from rest_framework import status, filters
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Post,
    PaymentTransaction,
    Feedback,
    AdminAuditLog,
    AdminProfile,
    PostAccess,
    PostComment
)
from .admin_serializers import (
    AdminPostSerializer,
    AdminPaymentSerializer,
    AdminFeedbackSerializer,
    AdminAuditLogSerializer,
    AdminProfileSerializer,
    AdminPasswordResetRequestSerializer,
    AdminPasswordResetSerializer,
    AdminPostAccessSerializer,
    AdminPostCommentSerializer
)
from .pagination import AdminPagination

from rest_framework import generics, permissions, status
from django.db.models import Q

# -------------------------
# Admin Profile
# -------------------------
class AdminProfileView(APIView):
    permission_classes = [IsActiveAdminUser]

    def get(self, request):
        profile, _ = AdminProfile.objects.get_or_create(user=request.user)
        serializer = AdminProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = AdminProfile.objects.get_or_create(user=request.user)
        serializer = AdminProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Admin Change Password
# -------------------------
class AdminChangePasswordView(APIView):
    permission_classes = [IsActiveAdminUser]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"detail": "Old and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        AdminAuditLog.objects.create(
            admin=user,
            action="UPDATE",
            model_name="Password"
        )

        return Response({"detail": "Password changed successfully."})


# -------------------------
# Admin Password Reset Request
# -------------------------
class AdminPasswordResetRequestView(APIView):
    def post(self, request):
        serializer = AdminPasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email, is_staff=True, is_active=True)
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/admin/reset-password?uid={user.pk}&token={token}"

            send_mail(
                subject="Admin Dashboard - Password Reset Request",
                message=f"Click the link below to securely reset your administrative password:\n\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

        except User.DoesNotExist:
            # 🔐 Silent failure to prevent user enumeration attacks
            pass

        return Response(
            {"detail": "If an active admin account exists, a reset link has been sent."},
            status=status.HTTP_200_OK
        )


# -------------------------
# Admin Password Reset
# -------------------------
class AdminPasswordResetView(APIView):
    def post(self, request):
        serializer = AdminPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid_decoded = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid_decoded, is_staff=True, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid reset request or inactive account."}, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        AdminAuditLog.objects.create(
            admin=user,
            action="UPDATE",
            model_name="Password (Reset)"
        )

        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )


# -------------------------
# Admin Post ViewSet
# -------------------------
class AdminPostViewSet(ModelViewSet):
    queryset = Post.objects.select_related("author").order_by("-created_at")
    serializer_class = AdminPostSerializer
    permission_classes = [IsActiveAdminUser]
    pagination_class = AdminPagination
    lookup_field = "slug"

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["category", "featured", "is_published", "series_name"] 
    search_fields = ["title", "category", "content", "meta_description", "author__username", "series_name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        query_params = self.request.query_params
        
        category = query_params.get("category")
        min_price = query_params.get("min_price")
        max_price = query_params.get("max_price")
        date_range = query_params.get("date_range")

        if category:
            queryset = queryset.filter(category=category)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        if date_range:
            now = timezone.now()
            if date_range == "today":
                queryset = queryset.filter(created_at__date=now.date())
            else:
                try:
                    queryset = queryset.filter(created_at__gte=now - timedelta(days=int(date_range)))
                except ValueError:
                    pass
        return queryset

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        AdminAuditLog.objects.create(
            admin=self.request.user, action="CREATE", model_name="Post", object_id=post.id
        )

    def perform_update(self, serializer):
        post = serializer.save()
        AdminAuditLog.objects.create(
            admin=self.request.user, action="UPDATE", model_name="Post", object_id=post.id
        )

    def perform_destroy(self, instance):
        AdminAuditLog.objects.create(
            admin=self.request.user, action="DELETE", model_name="Post", object_id=instance.id
        )
        instance.delete()

    @action(detail=False, methods=["post"])
    def bulk_feature(self, request):
        slugs = request.data.get("slugs", [])
        if not slugs:
            return Response({"featured_count": 0})

        # Wrap in a transaction to prevent database inconsistency if the process fails midway
        with transaction.atomic():
            Post.objects.update(featured=False)
            Post.objects.filter(slug=slugs[0]).update(featured=True)

        return Response({"featured_slug": slugs[0]})

    @action(detail=False, methods=["get"])
    def categories(self, request):
        categories = Post.objects.values_list("category", flat=True).distinct()
        return Response({"categories": list(categories)})


# -------------------------
# Admin Payment ViewSet
# -------------------------
class AdminPaymentViewSet(ModelViewSet):
    queryset = PaymentTransaction.objects.select_related("post").order_by("-created_at")
    serializer_class = AdminPaymentSerializer
    permission_classes = [IsActiveAdminUser]
    pagination_class = AdminPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ["status"]
    search_fields = ["phone", "post__title", "mpesa_receipt"]
    ordering_fields = ["created_at", "amount"]

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="payments_export.csv"'
        response.write(codecs.BOM_UTF8)

        writer = csv.writer(response)
        writer.writerow(["Date", "Phone Number", "Amount (Kshs)", "Payment Status", "M-Pesa Receipt", "Article Title"])

        queryset = self.filter_queryset(self.get_queryset())
        
        for tx in queryset:
            formatted_date = f'="{tx.created_at.strftime("%Y-%m-%d %H:%M")}"'
            formatted_phone = f'="{tx.phone}"' if tx.phone else "-"
            formatted_receipt = f'="{tx.mpesa_receipt}"' if tx.mpesa_receipt else "-"

            writer.writerow([
                formatted_date,
                formatted_phone,
                tx.amount,
                tx.status,
                formatted_receipt,
                tx.post.title
            ])
        
        AdminAuditLog.objects.create(
            admin=request.user, action="EXPORT", model_name="PaymentTransaction",
            details={"filters_applied": request.query_params}
        )
        return response

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        payments = PaymentTransaction.objects.all()
        success_payments = payments.filter(status="SUCCESS")

        total_revenue = success_payments.aggregate(total=Sum("amount"))["total"] or 0
        total_transactions = payments.count()

        status_counts = {
            item["status"]: item["count"]
            for item in payments.values("status").annotate(count=Count("id"))
        }

        success_count = status_counts.get("SUCCESS", 0)
        failed_count = status_counts.get("FAILED", 0)

        success_rate = (success_count / total_transactions * 100) if total_transactions else 0
        failed_rate = (failed_count / total_transactions * 100) if total_transactions else 0

        active_users = success_payments.values("phone").distinct().count()
        arpu = (total_revenue / active_users) if active_users else 0

        revenue_per_post = success_payments.values("post__id", "post__title")\
            .annotate(revenue=Sum("amount")).order_by("-revenue")

        revenue_by_category = success_payments.values("post__category")\
            .annotate(revenue=Sum("amount")).order_by("-revenue")

        period = request.query_params.get("period", "daily")
        trunc_func = {
            "daily": TruncDate, "weekly": TruncWeek, 
            "monthly": TruncMonth, "yearly": TruncYear
        }.get(period, TruncDate)

        transactions_over_time = success_payments.annotate(date=trunc_func("created_at"))\
            .values("date").annotate(revenue=Sum("amount"), transactions=Count("id")).order_by("date")

        return Response({
            "summary": {
                "total_revenue": float(total_revenue),
                "total_transactions": total_transactions,
                "active_users": active_users,
                "arpu": round(arpu, 2),
                "success_rate": round(success_rate, 2),
                "failed_rate": round(failed_rate, 2),
                "status_counts": status_counts,
            },
            "revenue_per_post": list(revenue_per_post),
            "revenue_by_category": list(revenue_by_category),
            "transactions_over_time": list(transactions_over_time),
        })


# -------------------------
# Admin Feedback
# -------------------------
class AdminFeedbackViewSet(ModelViewSet):
    queryset = Feedback.objects.all().order_by("-created_at")
    serializer_class = AdminFeedbackSerializer
    permission_classes = [IsActiveAdminUser]
    pagination_class = AdminPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_approved", "rating"] 
    search_fields = ["name", "email", "comment"]
    ordering_fields = ["created_at", "rating"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        feedback = self.get_object()
        feedback.is_approved = True
        feedback.save()
        AdminAuditLog.objects.create(
            admin=request.user, action="UPDATE", model_name="Feedback",
            object_id=feedback.id, details={"approved": True},
        )
        return Response({"status": "APPROVED"})
    
    @action(detail=False, methods=["get"])
    def analytics(self, request):
        approved_feedback = Feedback.objects.filter(is_approved=True)

        # Run the aggregation ONLY on the approved subset
        avg_ratings = approved_feedback.annotate(date=TruncDate('created_at'))\
            .values('date').annotate(avg_rating=Avg('rating')).order_by('date')

        rating_dist = approved_feedback.values('rating').annotate(count=Count('id'))

        return Response({
            "avg_ratings": list(avg_ratings),
            "rating_distribution": list(rating_dist),
        })


# -------------------------
# Admin Dashboard
# -------------------------
class AdminDashboardViewSet(ViewSet):
    permission_classes = [IsActiveAdminUser]

    def list(self, request):
        today = timezone.localtime(timezone.now())
        this_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        if this_month_start.month == 1:
            last_month_start = this_month_start.replace(year=this_month_start.year - 1, month=12)
        else:
            last_month_start = this_month_start.replace(month=this_month_start.month - 1)

        this_month_revenue = PaymentTransaction.objects.filter(
            status="SUCCESS", created_at__gte=this_month_start
        ).aggregate(total=Sum("amount"))["total"] or 0

        last_month_revenue = PaymentTransaction.objects.filter(
            status="SUCCESS", created_at__gte=last_month_start, created_at__lt=this_month_start
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_views = Post.objects.aggregate(total=Sum("views"))["total"] or 0
        total_customers = PaymentTransaction.objects.values("phone").distinct().count()
        repeat_customers = PaymentTransaction.objects.values("phone").annotate(c=Count("id")).filter(c__gt=1).count()
        new_customers = PaymentTransaction.objects.filter(status="SUCCESS", created_at__gte=this_month_start).values("phone").distinct().count()

        top_posts_qs = PaymentTransaction.objects.filter(status="SUCCESS")\
            .values("post__id", "post__title", "post__price", "post__views")\
            .annotate(revenue=Sum("amount"), sales=Count("id")).order_by("-revenue")[:5]
        
        top_posts = [
            {
                "title": p["post__title"],
                "revenue": p["revenue"],
                "sales": p["sales"],
                "views": p["post__views"] or 1,
                "conversion_rate": round(((p["sales"] / (p["post__views"] or 1)) * 100), 1)
            } for p in top_posts_qs
        ]

        post = Post.objects.filter(featured=True).first()
        featured_post = {
            "id": post.id, 
            "title": post.title, 
            "price": post.price, 
            "category": post.category,
            "created_at": post.created_at, 
            "author": post.author.username,
            
            # 🚀 THE FIX: Explicitly pass the new fields to the React dashboard!
            "custom_author": post.custom_author,
            "series_name": post.series_name,
            "part_number": post.part_number,
            
            "banner_image": request.build_absolute_uri(post.banner_image.url) if post.banner_image else None
        } if post else None

        one_year_ago = today - timedelta(days=365)
        monthly_trend = PaymentTransaction.objects.filter(status="SUCCESS", created_at__gte=one_year_ago)\
            .annotate(month=TruncMonth("created_at")).values("month")\
            .annotate(revenue=Sum("amount"), sales=Count("id")).order_by("month")

        return Response({
            "kpis": {
                "this_month_revenue": float(this_month_revenue),
                "last_month_revenue": float(last_month_revenue),
                "growth": (((this_month_revenue - last_month_revenue) / last_month_revenue) * 100) if last_month_revenue > 0 else 0,
                "total_views": total_views,
                "total_customers": total_customers,
                "repeat_customers": repeat_customers,
                "new_customers": new_customers,
                "feedback_count": Feedback.objects.count(),
            },
            "featured_post": featured_post,
            "top_posts": top_posts,
            "revenue_trend": [
                {"month": m["month"].strftime("%b %Y"), "revenue": float(m["revenue"]), "sales": m["sales"]}
                for m in monthly_trend
            ],
        })


# -------------------------
# Admin Post Access
# -------------------------
class AdminPostAccessViewSet(ReadOnlyModelViewSet):
    serializer_class = AdminPostAccessSerializer
    permission_classes = [IsActiveAdminUser]
    pagination_class = AdminPagination

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["post__title", "user__email"]
    ordering_fields = ["granted_at", "post__title"]
    ordering = ["-granted_at"]

    def get_queryset(self):
        queryset = PostAccess.objects.select_related("post", "user").order_by("-granted_at")
        category = self.request.query_params.get("category")
        date_range = self.request.query_params.get("date_range")

        if category:
            queryset = queryset.filter(post__category=category)

        if date_range:
            now = timezone.now()
            if date_range == "today":
                queryset = queryset.filter(granted_at__date=now.date())
            else:
                try:
                    queryset = queryset.filter(granted_at__gte=now - timedelta(days=int(date_range)))
                except ValueError:
                    pass

        return queryset


# -------------------------
# Admin Audit Logs
# -------------------------
# 🚨 SECURED: Changed from ModelViewSet to ReadOnlyModelViewSet 
# to prevent compromised admin accounts from wiping their own trails.
class AdminAuditLogViewSet(ReadOnlyModelViewSet):
    queryset = AdminAuditLog.objects.select_related("admin").order_by("-timestamp")
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsActiveAdminUser]
    pagination_class = AdminPagination

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["action", "model_name"]
    search_fields = ["admin__username", "model_name", "details"]
    ordering_fields = ["timestamp", "action", "model_name"]
    ordering = ["-timestamp"]


# -------------------------
# Post Comments
# -------------------------
class AdminCommentListView(generics.ListAPIView):
    serializer_class = AdminPostCommentSerializer
    permission_classes = [permissions.IsAdminUser] 

    pagination_class = AdminPagination
    
    def get_queryset(self):
        queryset = PostComment.objects.all().order_by('-created_at')
        
        post_id = self.request.query_params.get('post')
        is_approved = self.request.query_params.get('is_approved')
        search = self.request.query_params.get('search')

        if post_id:
            queryset = queryset.filter(post_id=post_id)
            
        # 🚀 THE FIX: Make sure we also check that it is not an empty string!
        if is_approved is not None and is_approved != "":
            approved_bool = str(is_approved).lower() in ['true', '1', 't']
            queryset = queryset.filter(is_approved=approved_bool)
            
        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) | Q(name__icontains=search)
            )

        return queryset

class AdminCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles fetching a single comment, updating it (e.g., toggling is_approved), or deleting it.
    """
    queryset = PostComment.objects.all()
    serializer_class = AdminPostCommentSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCommentApproveView(APIView):
    """
    A specific endpoint just for quickly approving a comment with one click.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            comment = PostComment.objects.get(pk=pk)
            comment.is_approved = True
            comment.save()
            return Response({"message": "Comment securely approved."}, status=status.HTTP_200_OK)
        except PostComment.DoesNotExist:
            return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)