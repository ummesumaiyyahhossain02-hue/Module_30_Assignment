from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.users.models import User

from .models import Bill
from .permissions import CanAccessBilling
from .serializers import BillSerializer


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related("patient__user").all()
    serializer_class = BillSerializer
    permission_classes = [CanAccessBilling]

    @action(detail=True, methods=["patch"])
    def mark_paid(self, request, pk=None):
        bill = self.get_object()
        if bill.paid:
            raise ValidationError({"paid": ["This bill has already been marked as paid."]})
        bill.paid = True
        bill.save(update_fields=["paid"])
        serializer = self.get_serializer(bill)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == User.Role.PATIENT:
            return queryset.filter(patient__user=user)
        return queryset
