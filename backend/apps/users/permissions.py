from rest_framework.permissions import BasePermission

from apps.users.models import User


class IsAdmin(BasePermission):
    """Matrix: Manage Users -> admin only."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )
