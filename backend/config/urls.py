"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # API schema / docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),

    # App routes
    path("api/auth/", include("apps.users.urls")),
    path("api/doctors/", include("apps.doctors.urls")),
    path("api/patients/", include("apps.patients.urls")),
    path("api/departments/", include("apps.departments.urls")),
    path("api/appointments/", include("apps.appointments.urls")),
    path("api/prescriptions/", include("apps.prescriptions.urls")),
    path("api/medicines/", include("apps.medicines.urls")),
    path("api/billing/", include("apps.billing.urls")),
]
