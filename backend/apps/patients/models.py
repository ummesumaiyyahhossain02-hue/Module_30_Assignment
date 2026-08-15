from django.conf import settings
from django.db import models


class Patient(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient"
    )
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=20)
    blood_group = models.CharField(max_length=10)
    address = models.TextField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.user.get_full_name() or self.user.username
