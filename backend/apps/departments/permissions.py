from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class IsAdminOrReadOnly(BasePermission):
    """Not in the matrix explicitly; departments back doctor CRUD, so admin manages,
    every other authenticated role can read (needed to list departments when
    creating/viewing doctors)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.role == User.Role.ADMIN
