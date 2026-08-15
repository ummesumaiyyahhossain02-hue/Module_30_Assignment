from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class IsAdminOrOwnerDoctorOrReceptionistReadOnly(BasePermission):
    """Matrix: CRUD Doctors -> admin full, doctor own, receptionist view, patient none."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == User.Role.ADMIN:
            return True
        if user.role == User.Role.RECEPTIONIST:
            return request.method in SAFE_METHODS
        if user.role == User.Role.DOCTOR:
            return True
        if user.role == User.Role.PATIENT:
            return request.method in SAFE_METHODS
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == User.Role.ADMIN:
            return True
        if user.role == User.Role.RECEPTIONIST:
            return request.method in SAFE_METHODS
        if user.role == User.Role.DOCTOR:
            return obj.user_id == user.id
        if user.role == User.Role.PATIENT:
            return request.method in SAFE_METHODS
        return False
