from rest_framework import viewsets

from .models import Medicine
from .permissions import IsAdminOrReadOnly
from .serializers import MedicineSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name", "description"]
