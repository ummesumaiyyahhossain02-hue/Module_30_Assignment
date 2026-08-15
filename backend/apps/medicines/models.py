from django.db import models


class Medicine(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    unit = models.CharField(max_length=50, help_text="e.g. mg, ml, tablet")

    def __str__(self):
        return self.name
