from django.db import models

from apps.patients.models import Patient


class Bill(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="bills"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id} for {self.patient} - {self.amount}"
