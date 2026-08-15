from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.departments.models import Department
from apps.doctors.models import Doctor
from apps.medicines.models import Medicine
from apps.patients.models import Patient
from apps.users.models import User

PASSWORD = "Passw0rd!123"


class Command(BaseCommand):
    help = "Seeds the database with sample departments, users, doctors, patients, medicines, and an appointment."

    @transaction.atomic
    def handle(self, *args, **options):
        credentials = []

        departments = self._create_departments()
        admin = self._create_admin(credentials)
        receptionist = self._create_receptionist(credentials)
        doctors = self._create_doctors(departments, credentials)
        patients = self._create_patients(credentials)
        self._create_medicines()
        self._create_appointment(patients[0], doctors[0])

        self._print_credentials(credentials)

    def _create_departments(self):
        names = [
            ("Cardiology", "Diagnosis and treatment of heart conditions."),
            ("Neurology", "Diagnosis and treatment of nervous system disorders."),
            ("Orthopedics", "Diagnosis and treatment of musculoskeletal conditions."),
        ]
        departments = []
        for name, description in names:
            department, _ = Department.objects.get_or_create(
                name=name, defaults={"description": description}
            )
            departments.append(department)
        self.stdout.write(self.style.SUCCESS(f"Created {len(departments)} departments."))
        return departments

    def _create_admin(self, credentials):
        username = "admin"
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": "admin@hospital.test",
                "first_name": "Admin",
                "last_name": "User",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            user.set_password(PASSWORD)
            user.save()
        credentials.append(("Admin", username, PASSWORD))
        self.stdout.write(self.style.SUCCESS("Created admin user."))
        return user

    def _create_receptionist(self, credentials):
        username = "receptionist1"
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": "receptionist1@hospital.test",
                "first_name": "Nusrat",
                "last_name": "Jahan",
                "role": User.Role.RECEPTIONIST,
            },
        )
        if created:
            user.set_password(PASSWORD)
            user.save()
        credentials.append(("Receptionist", username, PASSWORD))
        self.stdout.write(self.style.SUCCESS("Created receptionist user."))
        return user

    def _create_doctors(self, departments, credentials):
        doctor_specs = [
            (
                "doctor1",
                "Kamal",
                "Hossain",
                departments[0],
                "Interventional Cardiology",
                "01711-223344",
            ),
            (
                "doctor2",
                "Farzana",
                "Akter",
                departments[1],
                "Pediatric Neurology",
                "01822-334455",
            ),
        ]
        doctors = []
        for username, first_name, last_name, department, specialization, phone in doctor_specs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@hospital.test",
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": User.Role.DOCTOR,
                },
            )
            if created:
                user.set_password(PASSWORD)
                user.save()
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "department": department,
                    "specialization": specialization,
                    "phone": phone,
                    "experience": 8,
                    "is_available": True,
                },
            )
            doctors.append(doctor)
            credentials.append(("Doctor", username, PASSWORD))
        self.stdout.write(self.style.SUCCESS(f"Created {len(doctors)} doctors."))
        return doctors

    def _create_patients(self, credentials):
        patient_specs = [
            (
                "patient1",
                "Rahima",
                "Begum",
                34,
                "Female",
                "O+",
                "House 12, Road 5, Dhanmondi, Dhaka",
                "01911-556677",
            ),
            (
                "patient2",
                "Abdul",
                "Karim",
                45,
                "Male",
                "A-",
                "Bakalia, Chattogram",
                "01611-889900",
            ),
        ]
        patients = []
        for username, first_name, last_name, age, gender, blood_group, address, phone in patient_specs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@hospital.test",
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": User.Role.PATIENT,
                },
            )
            if created:
                user.set_password(PASSWORD)
                user.save()
            patient, _ = Patient.objects.get_or_create(
                user=user,
                defaults={
                    "age": age,
                    "gender": gender,
                    "blood_group": blood_group,
                    "address": address,
                    "phone": phone,
                },
            )
            patients.append(patient)
            credentials.append(("Patient", username, PASSWORD))
        self.stdout.write(self.style.SUCCESS(f"Created {len(patients)} patients."))
        return patients

    def _create_medicines(self):
        medicines = [
            ("Napa", "Paracetamol 500mg - pain reliever and fever reducer.", "tablet"),
            ("Seclo", "Omeprazole 20mg capsule for acidity and gastric ulcer.", "capsule"),
            ("Fexo", "Fexofenadine 120mg antihistamine for allergy relief.", "tablet"),
            ("Monas", "Montelukast 10mg for asthma and allergic rhinitis.", "tablet"),
            ("Amodis", "Metronidazole 400mg antibiotic for bacterial infections.", "tablet"),
        ]
        count = 0
        for name, description, unit in medicines:
            _, created = Medicine.objects.get_or_create(
                name=name, defaults={"description": description, "unit": unit}
            )
            count += created
        self.stdout.write(self.style.SUCCESS(f"Ensured {len(medicines)} medicines exist."))

    def _create_appointment(self, patient, doctor):
        appointment, created = Appointment.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            appointment_date=timezone.now() + timedelta(days=1),
            defaults={"status": Appointment.Status.PENDING},
        )
        self.stdout.write(self.style.SUCCESS("Created sample appointment."))
        return appointment

    def _print_credentials(self, credentials):
        self.stdout.write("")
        self.stdout.write(self.style.MIGRATE_HEADING("Seeded login credentials:"))
        self.stdout.write(f"{'Role':<14}{'Username':<16}Password")
        self.stdout.write("-" * 44)
        for role, username, password in credentials:
            self.stdout.write(f"{role:<14}{username:<16}{password}")
