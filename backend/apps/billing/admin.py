from django.contrib import admin

from .models import Bill


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("patient", "amount", "paid", "created_at")
    search_fields = ("patient__user__username",)
    list_filter = ("paid", "created_at")
