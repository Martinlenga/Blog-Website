import csv
from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet, ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status, filters
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.tokens import RefreshToken

from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from django.conf import settings

from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncMonth, TruncYear, TruncDate, TruncWeek
from django.utils.timezone import now
from datetime import timedelta

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail


from .models import (
    Post,
    PaymentTransaction,
    Feedback,
    AdminAuditLog,
    AdminProfile,
    PostAccess,
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

)
from .pagination import AdminPagination
import codecs  

# -------------------------
# Admin Profile
# -------------------------
class AdminProfileView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        profile, _ = AdminProfile.objects.get_or_create(user=request.user)
        serializer = AdminProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = AdminProfile.objects.get_or_create(user=request.user)
        print("Incoming Data:", request.data)
        serializer = AdminProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            # Return the updated profile immediately
            return Response(serializer.data) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Admin Change Password
# -------------------------
class AdminChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"detail": "Old and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔐 Password strength validation
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {"detail": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        AdminAuditLog.objects.create(
            admin=user,
            action="UPDATE",
            model_name="Password"
        )

        return Response({"detail": "Password changed successfully"})



# -------------------------
# Admin Password Reset Request
# -------------------------
class AdminPasswordResetRequestView(APIView):
    def post(self, request):
        serializer = AdminPasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email, is_staff=True)

            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/admin/reset-password?uid={user.pk}&token={token}"

            send_mail(
                subject="Admin Password Reset",
                message=f"Click the link to reset your password:\n\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

        except User.DoesNotExist:
            # 🔐 Do NOTHING — prevent email enumeration
            pass

        return Response(
            {"detail": "If an admin account exists, a reset link has been sent."},
            status=status.HTTP_200_OK
        )

# -------------------------
# Admin Password Reset
# -------------------------
class AdminPasswordResetView(APIView):
    def post(self, request):
        serializer = AdminPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(pk=uid, is_staff=True)
        except User.DoesNotExist:
            return Response({"detail": "Invalid reset request."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        # 🔐 Password strength validation
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {"detail": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

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
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    lookup_field = "slug"

    # Global search across multiple fields
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["category", "featured", "is_published"]
    search_fields = ["title", "category", "content", "meta_description", "author__username"]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filters
        category = self.request.query_params.get("category")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        date_range = self.request.query_params.get("date_range")  # today, 7, 14, 30

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
                queryset = queryset.filter(
                    created_at__gte=now - timedelta(days=int(date_range))
                )
        return queryset

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        AdminAuditLog.objects.create(
            admin=self.request.user,
            action="CREATE",
            model_name="Post",
            object_id=post.id,
        )

    def perform_update(self, serializer):
        post = serializer.save()
        AdminAuditLog.objects.create(
            admin=self.request.user,
            action="UPDATE",
            model_name="Post",
            object_id=post.id,
        )

    def perform_destroy(self, instance):
        AdminAuditLog.objects.create(
            admin=self.request.user,
            action="DELETE",
            model_name="Post",
            object_id=instance.id,
        )
        instance.delete()

    @action(detail=False, methods=["post"])
    def bulk_feature(self, request):
        slugs = request.data.get("slugs", [])
        if not slugs:
            return Response({"featured_count": 0})

        # Un-feature all posts first
        Post.objects.update(featured=False)

        # Feature only the first post in the list
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
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ["status"]
    search_fields = ["phone", "post__title", "mpesa_receipt"]
    ordering_fields = ["created_at", "amount"]

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    

    # ⭐ REFIXED FEATURE: Clean & Human-Readable CSV Export (No Encoding Garbage)
    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        # Change content type explicitly to avoid raw text conversion conflicts
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="payments_export.csv"'

        # 1. 🌟 THE EXACT MOJIBAKE FIX: Write the byte stream directly as binary raw data
        # This prevents the raw string from showing up as "Ã¯»¿Da" in Excel
        response.write(codecs.BOM_UTF8)

        writer = csv.writer(response)
        writer.writerow(["Date", "Phone Number", "Amount (Kshs)", "Payment Status", "M-Pesa Receipt", "Article Title"])

        queryset = self.filter_queryset(self.get_queryset())
        
        for tx in queryset:
            # 1. 🌟 THE DATE LAYOUT FIX: Force Excel to evaluate the timestamp as a text string
            # This completely stops Excel from changing it to a Date type and throwing #####
            formatted_date = f'="{tx.created_at.strftime("%Y-%m-%d %H:%M")}"'
            
            formatted_phone = f'="{tx.phone}"' if tx.phone else "-"
            formatted_receipt = f'="{tx.mpesa_receipt}"' if tx.mpesa_receipt else "-"

            writer.writerow([
                formatted_date,  # Uses the forced text string version
                formatted_phone,
                tx.amount,
                tx.status,
                formatted_receipt,
                tx.post.title
            ])
        
        AdminAuditLog.objects.create(
            admin=request.user, 
            action="EXPORT", 
            model_name="PaymentTransaction",
            details={"filters_applied": request.query_params}
        )
        return response

    # =========================
    # 📊 Analytics Endpoint
    # =========================
    @action(detail=False, methods=["get"])
    def analytics(self, request):
        payments = PaymentTransaction.objects.all()

        # -----------------------
        # Summary Metrics
        # -----------------------
        success_payments = payments.filter(status="SUCCESS")

        total_revenue = success_payments.aggregate(
            total=Sum("amount")
        )["total"] or 0

        total_transactions = payments.count()

        status_counts_qs = payments.values("status").annotate(
            count=Count("id")
        )

        status_counts = {
            item["status"]: item["count"]
            for item in status_counts_qs
        }

        success_count = status_counts.get("SUCCESS", 0)
        failed_count = status_counts.get("FAILED", 0)

        success_rate = (
            (success_count / total_transactions) * 100
            if total_transactions else 0
        )

        failed_rate = (
            (failed_count / total_transactions) * 100
            if total_transactions else 0
        )

        # -----------------------
        # ARPU (phone-based)
        # -----------------------
        active_users = success_payments.values("phone").distinct().count()
        arpu = (total_revenue / active_users) if active_users else 0

        # -----------------------
        # Revenue per Post
        # -----------------------
        revenue_per_post = success_payments.values(
            "post__id",
            "post__title"
        ).annotate(
            revenue=Sum("amount")
        ).order_by("-revenue")

        # -----------------------
        # Revenue by Category
        # (category is a CharField)
        # -----------------------
        revenue_by_category = success_payments.values(
            "post__category"
        ).annotate(
            revenue=Sum("amount")
        ).order_by("-revenue")

        # -----------------------
        # Revenue Over Time
        # Supports: daily | weekly | monthly | yearly
        # -----------------------
        period = request.query_params.get("period", "daily")

        trunc_map = {
            "daily": TruncDate,
            "weekly": TruncWeek,
            "monthly": TruncMonth,
            "yearly": TruncYear,
        }

        trunc_func = trunc_map.get(period, TruncDate)

        transactions_over_time = success_payments.annotate(
            date=trunc_func("created_at")
        ).values(
            "date"
        ).annotate(
            revenue=Sum("amount"),
            transactions=Count("id")
        ).order_by("date")

        # -----------------------
        # Final Response
        # -----------------------
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


# Admin Feedback
class AdminFeedbackViewSet(ModelViewSet):
    queryset = Feedback.objects.all().order_by("-created_at")
    serializer_class = AdminFeedbackSerializer
    permission_classes = [IsAdminUser]
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
            admin=request.user,
            action="UPDATE",
            model_name="Feedback",
            object_id=feedback.id,
            details={"approved": True},
        )
        return Response({"status": "APPROVED"})
    
    @action(detail=False, methods=["get"])
    def analytics(self, request):
        # Average rating per day
        avg_ratings = Feedback.objects.annotate(date=TruncDate('created_at'))\
            .values('date')\
            .annotate(avg_rating=Avg('rating'))\
            .order_by('date')

        # Distribution by rating
        rating_dist = Feedback.objects.values('rating').annotate(count=Count('id'))

        return Response({
            "avg_ratings": list(avg_ratings),
            "rating_distribution": list(rating_dist),
        })


# -------------------------
# Admin Dashboard
# -------------------------
class AdminDashboardViewSet(ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        today = now()
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

        # 1. Revenue
        this_month_revenue = PaymentTransaction.objects.filter(
            status="SUCCESS", created_at__gte=this_month_start
        ).aggregate(total=Sum("amount"))["total"] or 0

        last_month_revenue = PaymentTransaction.objects.filter(
            status="SUCCESS",
            created_at__gte=last_month_start,
            created_at__lt=this_month_start,
        ).aggregate(total=Sum("amount"))["total"] or 0

        # 2. Total Views (Site Traffic) - NEW
        total_views = Post.objects.aggregate(total=Sum("views"))["total"] or 0

        # CUSTOMER BEHAVIOR
        total_customers = PaymentTransaction.objects.values("phone").distinct().count()
        repeat_customers = (
            PaymentTransaction.objects.values("phone")
            .annotate(c=Count("id"))
            .filter(c__gt=1)
            .count()
        )
        new_customers = (
            PaymentTransaction.objects.filter(
                status="SUCCESS", created_at__gte=this_month_start
            )
            .values("phone")
            .distinct()
            .count()
        )

        # 3. Top Posts (Added Conversion Rate & Views) - NEW
        top_posts_qs = (
            PaymentTransaction.objects.filter(status="SUCCESS")
            .values("post__id", "post__title", "post__price", "post__views")
            .annotate(revenue=Sum("amount"), sales=Count("id"))
            .order_by("-revenue")[:5]
        )
        
        top_posts = []
        for p in top_posts_qs:
            views = p["post__views"] or 1 # Avoid div zero
            sales = p["sales"]
            conversion = (sales / views) * 100 if views > 0 else 0
            
            top_posts.append({
                "title": p["post__title"],
                "revenue": p["revenue"],
                "sales": sales,
                "views": views,
                "conversion_rate": round(conversion, 1)
            })

        # FEATURED POST (only one active)
        post = Post.objects.filter(featured=True).first()

        featured_post = None

        if post:
            featured_post = {
                "id": post.id,
                "title": post.title,
                "banner_image": request.build_absolute_uri(post.banner_image.url) if post.banner_image else None,
                "price": post.price,
                "category": post.category,
                "created_at": post.created_at,
                "author": post.author.username,
            }


        # MONTHLY TREND (12 months)
        one_year_ago = today - timedelta(days=365)
        monthly_trend = (
            PaymentTransaction.objects.filter(
                status="SUCCESS", created_at__gte=one_year_ago
            )
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(revenue=Sum("amount"), sales=Count("id"))
            .order_by("month")
        )
        monthly_chart = [
            {
                "month": m["month"].strftime("%b %Y"),
                "revenue": float(m["revenue"]),
                "sales": m["sales"],
            }
            for m in monthly_trend
        ]

        # FEEDBACK
        feedback_count = Feedback.objects.count()

        return Response({
            "kpis": {
                "this_month_revenue": float(this_month_revenue),
                "last_month_revenue": float(last_month_revenue),
                "growth": (
                    ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
                    if last_month_revenue > 0 else 0
                ),
                "total_views": total_views, # Added Total Views to KPIs
                "total_customers": total_customers,
                "repeat_customers": repeat_customers,
                "new_customers": new_customers,
                "feedback_count": feedback_count,
            },
            "featured_post": featured_post,
            "top_posts": top_posts, # Uses the new structure
            "revenue_trend": monthly_chart,
        })


class AdminPostAccessViewSet(ReadOnlyModelViewSet):
    serializer_class = AdminPostAccessSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["post__title", "user__email"]
    ordering_fields = ["granted_at", "post__title"]
    ordering = ["-granted_at"]

    def get_queryset(self):
        queryset = PostAccess.objects.select_related("post", "user").order_by("-granted_at")

        # 🔎 Filter by Post category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(post__category=category)

        # 📅 Filter by granted_at date range
        date_range = self.request.query_params.get("date_range")
        if date_range:
            now = timezone.now()
            if date_range == "today":
                queryset = queryset.filter(granted_at__date=now.date())
            else:
                try:
                    days = int(date_range)
                    queryset = queryset.filter(granted_at__gte=now - timedelta(days=days))
                except ValueError:
                    pass  # ignore invalid input

        return queryset


# Audit Logs
class AdminAuditLogViewSet(ModelViewSet):
    queryset = (
        AdminAuditLog.objects
        .select_related("admin")
        .order_by("-timestamp")
    )
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = AdminPagination

    # 🔍 Filtering / searching / ordering
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = ["action", "model_name"]
    search_fields = [
        "admin__username",
        "model_name",
        "details",
    ]
    ordering_fields = ["timestamp", "action", "model_name"]
    ordering = ["-timestamp"]