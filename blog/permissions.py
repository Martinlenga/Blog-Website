from rest_framework.permissions import BasePermission

class IsActiveAdminUser(BasePermission):
    """
    Custom permission that strictly allows access only to fully authenticated,
    active, and administrative (staff) users.
    """
    
    def has_permission(self, request, view):
        # The bool() wrapper ensures a strict True/False return type, 
        # which prevents edge-case attribute errors in DRF's evaluation engine.
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.is_active  # 🚨 CRITICAL: Defense-in-depth lock
            and request.user.is_staff
        )