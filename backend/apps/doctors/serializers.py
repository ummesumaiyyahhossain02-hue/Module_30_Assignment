from rest_framework import serializers

from apps.users.models import User
from apps.users.serializers import UserSerializer

from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "user",
            "user_id",
            "department",
            "specialization",
            "phone",
            "experience",
            "is_available",
        ]

    def validate_user_id(self, value):
        queryset = Doctor.objects.filter(user=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This user already has a doctor profile.")
        return value
