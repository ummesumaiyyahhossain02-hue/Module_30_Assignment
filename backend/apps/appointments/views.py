from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.models import User

from .filters import AppointmentFilter
from .models import Appointment
from .permissions import CanBookAppointment, IsAppointmentOwnerOrAdminOrReceptionist
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient__user", "doctor__user").all()
    serializer_class = AppointmentSerializer
    permission_classes = [CanBookAppointment, IsAppointmentOwnerOrAdminOrReceptionist]
    filterset_class = AppointmentFilter

    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status"])
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role in (User.Role.ADMIN, User.Role.RECEPTIONIST):
            return queryset
        if user.role == User.Role.DOCTOR:
            return queryset.filter(doctor__user=user)
        if user.role == User.Role.PATIENT:
            return queryset.filter(patient__user=user)
        return queryset.none()
