from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.users.models import User


class CanBookAppointment(BasePermission):
    """Matrix: Book Appointment -> admin, patient, receptionist. Doctor cannot book."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method != "POST":
            return True
        return user.role in (User.Role.ADMIN, User.Role.PATIENT, User.Role.RECEPTIONIST)


class IsAppointmentOwnerOrAdminOrReceptionist(BasePermission):
    """Matrix: View Appointment -> admin all, receptionist all, doctor own, patient own."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in (User.Role.ADMIN, User.Role.RECEPTIONIST):
            return True
        if user.role == User.Role.DOCTOR:
            return obj.doctor.user_id == user.id
        if user.role == User.Role.PATIENT:
            return obj.patient.user_id == user.id
        return False
