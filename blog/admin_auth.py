from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status


class AdminTokenSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Serializer enforcing strict administrative access controls
    and injecting essential user profile metadata into the payload response.
    """
    def validate(self, attrs):
        # Base validation handles password check and generates standard tokens
        data = super().validate(attrs)
        
        # Guard Clause: Enforce that the user must be active and part of management/staff
        if not self.user.is_active:
            raise AuthenticationFailed("This account has been deactivated.", code="account_disabled")
            
        if not self.user.is_staff:
            raise AuthenticationFailed("Access denied. Administrative privileges required.", code="access_denied")
            
        # Inject user context directly into the JSON response for immediate frontend hydration
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "is_staff": self.user.is_staff,
            "is_superuser": self.user.is_superuser,
        }
        
        return data


class AdminLoginView(TokenObtainPairView):
    """
    Endpoint for administrative authentication. Returns access and refresh JWT tokens
    along with administrative user metadata.
    """
    serializer_class = AdminTokenSerializer
    permission_classes = [AllowAny]


class AdminLogoutView(APIView):
    """
    Endpoint to safely invalidate and blacklist a user's session refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required to complete logout."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            token = RefreshToken(refresh_token)
            # Blacklist the token to prevent future reuse
            token.blacklist()
            return Response(
                {"detail": "Successfully logged out and session invalidated."}, 
                status=status.HTTP_200_OK
            )
        except AttributeError:
            # Fallback if token_blacklist app isn't migrated or configured yet
            return Response(
                {"detail": "Token validation recognized, but blacklist application is missing in settings."},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
        except Exception:
            return Response(
                {"detail": "Token is invalid, malformed, or has already expired."}, 
                status=status.HTTP_400_BAD_REQUEST
            )