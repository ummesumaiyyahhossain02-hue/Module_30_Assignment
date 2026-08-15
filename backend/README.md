# Hospital Management API

A Django REST Framework project for hospital management, built with modular apps for users, doctors, patients, departments, appointments, prescriptions, medicines, and billing.

## Key Features

- Django-based backend using `Django 5.2`
- REST API powered by `djangorestframework`
- JWT authentication via `djangorestframework-simplejwt`
- Filtering support with `django-filter`
- OpenAPI schema generation with `drf-spectacular`
- Custom user model under `apps/users`

## Project Structure

- `apps/users/` - custom user model, authentication, and user management
- `apps/doctors/` - doctor profiles and related APIs
- `apps/patients/` - patient records and management
- `apps/departments/` - hospital departments
- `apps/appointments/` - appointment scheduling and tracking
- `apps/prescriptions/` - prescription creation and handling
- `apps/medicines/` - medicine inventory and details
- `apps/billing/` - billing records and payments
- `config/` - Django configuration, settings, and URL routing

## Getting Started

1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with required settings such as `SECRET_KEY`, `DEBUG`, and `DATABASE_URL`.
4. Apply migrations:
   ```bash
   python manage.py migrate
   ```
5. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Notes

- The project uses environment variables via `django-environ`.
- API endpoints are registered in each app's `urls.py` and served through `config/urls.py`.
- Seed or demo data may be available through management commands in `apps/users/management/commands/`.
