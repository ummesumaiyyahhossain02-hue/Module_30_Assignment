from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class CanAccessPrescription(BasePermission):
    """Matrix: Create Prescription -> admin, doctor. View Prescription -> admin, doctor
    (own), patient (own). Receptionist has no access at all."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.role == User.Role.RECEPTIONIST:
            return False
        if request.method not in SAFE_METHODS and user.role == User.Role.PATIENT:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == User.Role.ADMIN:
            return True
        if user.role == User.Role.DOCTOR:
            return obj.appointment.doctor.user_id == user.id
        if user.role == User.Role.PATIENT:
            return (
                request.method in SAFE_METHODS
                and obj.appointment.patient.user_id == user.id
            )
        return False
