from rest_framework import viewsets

from apps.users.models import User

from .models import Prescription
from .permissions import CanAccessPrescription
from .serializers import PrescriptionSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related(
        "appointment__doctor__user", "appointment__patient__user"
    ).prefetch_related("prescription_medicines__medicine")
    serializer_class = PrescriptionSerializer
    permission_classes = [CanAccessPrescription]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return queryset
        if user.role == User.Role.DOCTOR:
            return queryset.filter(appointment__doctor__user=user)
        if user.role == User.Role.PATIENT:
            return queryset.filter(appointment__patient__user=user)
        return queryset.none()
