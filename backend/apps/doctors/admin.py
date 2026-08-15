from django.contrib import admin

from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("user", "department", "specialization", "phone", "experience", "is_available")
    search_fields = ("user__username", "user__first_name", "user__last_name", "specialization")
    list_filter = ("department", "is_available")
