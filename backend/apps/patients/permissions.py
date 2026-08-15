from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class IsAdminOrReceptionistOrOwnerPatientOrDoctorReadOnly(BasePermission):
    """Matrix: CRUD Patients -> admin full, receptionist full, patient own, doctor view."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role in (User.Role.ADMIN, User.Role.RECEPTIONIST):
            return True
        if user.role == User.Role.DOCTOR:
            return request.method in SAFE_METHODS
        if user.role == User.Role.PATIENT:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in (User.Role.ADMIN, User.Role.RECEPTIONIST):
            return True
        if user.role == User.Role.DOCTOR:
            return request.method in SAFE_METHODS
        if user.role == User.Role.PATIENT:
            return obj.user_id == user.id
        return False
