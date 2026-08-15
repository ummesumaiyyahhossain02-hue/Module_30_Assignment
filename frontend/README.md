# Frontend

React (Vite) app consuming the backend API. Run the backend first.

## Setup

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173` and proxies `/api` to `http://localhost:8000`.

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Tech stack

React, React Router, Axios, Vite. Plain CSS, no UI framework.

## Features

- JWT login/register with role selection (admin, doctor, patient, receptionist)
- Role-based protected routes and navigation
- Doctors & patients: CRUD, doctor availability toggle
- Appointments: booking, filtering by doctor/patient/date, update/cancel
- Prescriptions: create with multiple medicines, view history
- Medicines: search and management
- Billing: generate bills, mark as paid

## Structure

```
src/
  api/         axios client + per-resource request functions
  context/     auth context (JWT storage, current user)
  routes/      protected route wrapper
  components/  navbar, shared UI
  pages/       one file per screen
```

## Demo accounts

After running `python manage.py seed_data` in `backend/`, all seeded users share password `Passw0rd!123`: `admin`, `receptionist1`, `doctor1`, `doctor2`, `patient1`, `patient2`.
