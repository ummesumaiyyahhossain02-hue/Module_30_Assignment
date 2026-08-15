from rest_framework import serializers

from apps.appointments.models import Appointment
from apps.users.models import User

from .models import Prescription, PrescriptionMedicine


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionMedicine
        fields = ["id", "prescription", "medicine", "dosage", "duration"]
        extra_kwargs = {"prescription": {"required": False}}


class PrescriptionSerializer(serializers.ModelSerializer):
    prescription_medicines = PrescriptionMedicineSerializer(many=True)

    class Meta:
        model = Prescription
        fields = [
            "id",
            "appointment",
            "diagnosis",
            "notes",
            "created_at",
            "prescription_medicines",
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        appointment = attrs.get("appointment", getattr(self.instance, "appointment", None))
        if appointment and appointment.status == Appointment.Status.CANCELLED:
            raise serializers.ValidationError(
                {"appointment": "Cannot create a prescription for a cancelled appointment."}
            )
        request = self.context.get("request")
        if (
            appointment
            and request
            and request.user.role == User.Role.DOCTOR
            and appointment.doctor.user_id != request.user.id
        ):
            raise serializers.ValidationError(
                {"appointment": "You can only create or update prescriptions for your own appointments."}
            )
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop("prescription_medicines")
        prescription = Prescription.objects.create(**validated_data)
        for item_data in items_data:
            item_data.pop("prescription", None)
            PrescriptionMedicine.objects.create(prescription=prescription, **item_data)
        return prescription

    def update(self, instance, validated_data):
        items_data = validated_data.pop("prescription_medicines", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.prescription_medicines.all().delete()
            for item_data in items_data:
                item_data.pop("prescription", None)
                PrescriptionMedicine.objects.create(prescription=instance, **item_data)

        return instance
