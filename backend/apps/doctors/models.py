from django.conf import settings
from django.db import models

from apps.departments.models import Department


class Doctor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor"
    )
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="doctors"
    )
    specialization = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    experience = models.PositiveIntegerField(help_text="Years of experience")
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"
