from django.contrib import admin

from .models import Prescription, PrescriptionMedicine


class PrescriptionMedicineInline(admin.TabularInline):
    model = PrescriptionMedicine
    extra = 1


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ("appointment", "diagnosis", "created_at")
    search_fields = ("appointment__patient__user__username", "diagnosis")
    list_filter = ("created_at",)
    inlines = [PrescriptionMedicineInline]
