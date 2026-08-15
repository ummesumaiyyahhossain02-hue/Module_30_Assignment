from rest_framework import viewsets

from apps.users.models import User

from .models import Patient
from .permissions import IsAdminOrReceptionistOrOwnerPatientOrDoctorReadOnly
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related("user").all()
    serializer_class = PatientSerializer
    permission_classes = [IsAdminOrReceptionistOrOwnerPatientOrDoctorReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == User.Role.PATIENT:
            return queryset.filter(user=user)
        return queryset
