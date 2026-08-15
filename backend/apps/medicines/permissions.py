from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class IsAdminOrReadOnly(BasePermission):
    """Matrix: Manage Medicines -> admin full, doctor/patient/receptionist view only."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.role == User.Role.ADMIN
