from django.db import models

from apps.appointments.models import Appointment
from apps.medicines.models import Medicine


class Prescription(models.Model):
    appointment = models.OneToOneField(
        Appointment, on_delete=models.CASCADE, related_name="prescription"
    )
    diagnosis = models.TextField()
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    medicines = models.ManyToManyField(
        Medicine, through="PrescriptionMedicine", related_name="prescriptions"
    )

    def __str__(self):
        return f"Prescription for {self.appointment}"


class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(
        Prescription, on_delete=models.CASCADE, related_name="prescription_medicines"
    )
    medicine = models.ForeignKey(
        Medicine, on_delete=models.CASCADE, related_name="prescription_medicines"
    )
    dosage = models.CharField(max_length=255, help_text='e.g. "500mg twice daily"')
    duration = models.CharField(max_length=255, help_text='e.g. "7 days"')

    def __str__(self):
        return f"{self.medicine} for {self.prescription}"
