from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Doctor
from .permissions import IsAdminOrOwnerDoctorOrReceptionistReadOnly
from .serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("user", "department").all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminOrOwnerDoctorOrReceptionistReadOnly]
    filterset_fields = ["is_available", "department"]

    @action(detail=True, methods=["patch"])
    def set_availability(self, request, pk=None):
        doctor = self.get_object()
        serializer = self.get_serializer(
            doctor, data={"is_available": request.data.get("is_available")}, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
