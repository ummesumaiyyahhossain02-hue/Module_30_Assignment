from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class CanAccessBilling(BasePermission):
    """Matrix: Generate Bill / Mark Bill Paid -> admin, receptionist. Doctor: no access.
    Patient: view own bills only (implied by "own" record access, not write)."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == User.Role.DOCTOR:
            return False
        if user.role in (User.Role.ADMIN, User.Role.RECEPTIONIST):
            return True
        if user.role == User.Role.PATIENT:
            return request.method in SAFE_METHODS
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in (User.Role.ADMIN, User.Role.RECEPTIONIST):
            return True
        if user.role == User.Role.PATIENT:
            return (
                request.method in SAFE_METHODS and obj.patient.user_id == user.id
            )
        return False
