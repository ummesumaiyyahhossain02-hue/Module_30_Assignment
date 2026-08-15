from django.utils import timezone
from rest_framework import serializers

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "appointment_date",
            "status",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def validate_appointment_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value

    def validate(self, attrs):
        doctor = attrs.get("doctor", getattr(self.instance, "doctor", None))
        appointment_date = attrs.get(
            "appointment_date", getattr(self.instance, "appointment_date", None)
        )
        if doctor and appointment_date:
            conflicts = Appointment.objects.filter(
                doctor=doctor, appointment_date=appointment_date
            ).exclude(status=Appointment.Status.CANCELLED)
            if self.instance:
                conflicts = conflicts.exclude(pk=self.instance.pk)
            if conflicts.exists():
                raise serializers.ValidationError(
                    {
                        "appointment_date": (
                            "This doctor already has an appointment at this date and time."
                        )
                    }
                )
        return attrs
