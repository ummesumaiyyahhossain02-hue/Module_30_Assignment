import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as appointmentsApi from "../api/appointments";
import { listDoctors } from "../api/doctors";
import { listPatients } from "../api/patients";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const STATUSES = ["pending", "approved", "completed", "cancelled"];

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const EMPTY_FORM = { patient: "", doctor: "", appointment_date: "", status: "pending" };

export default function AppointmentsPage() {
  const { user } = useAuth();
  const canBook = ["admin", "patient", "receptionist"].includes(user.role);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ doctor: "", patient: "", status: "", date_from: "", date_to: "" });

  const myPatientId = user.role === "patient" ? patients[0]?.id : null;

  function load() {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    Promise.all([appointmentsApi.listAppointments(params), listDoctors(), listPatients()])
      .then(([apptData, doctorData, patientData]) => {
        setAppointments(apptData);
        setDoctors(doctorData);
        setPatients(patientData);
      })
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  function doctorName(id) {
    const doc = doctors.find((d) => d.id === id);
    return doc ? `Dr. ${doc.user.first_name} ${doc.user.last_name}` : id;
  }

  function patientName(id) {
    const pat = patients.find((p) => p.id === id);
    return pat ? `${pat.user.first_name} ${pat.user.last_name}` : id;
  }

  function startBooking() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      patient: user.role === "patient" ? myPatientId ?? "" : "",
    });
    setShowForm(true);
  }

  function startEdit(appt) {
    setEditingId(appt.id);
    setForm({
      patient: appt.patient,
      doctor: appt.doctor,
      appointment_date: toDatetimeLocal(appt.appointment_date),
      status: appt.status,
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const payload = {
      patient: Number(form.patient),
      doctor: Number(form.doctor),
      appointment_date: new Date(form.appointment_date).toISOString(),
    };
    if (editingId) payload.status = form.status;
    try {
      if (editingId) {
        await appointmentsApi.updateAppointment(editingId, payload);
      } else {
        await appointmentsApi.createAppointment(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(parseError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await appointmentsApi.cancelAppointment(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await appointmentsApi.deleteAppointment(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <h1>Appointments</h1>
      <ErrorState message={error} />

      <div className="filters">
        <label>
          Doctor
          <select value={filters.doctor} onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}>
            <option value="">All</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.user.first_name} {d.user.last_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Patient
          <select value={filters.patient} onChange={(e) => setFilters({ ...filters, patient: e.target.value })}>
            <option value="">All</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user.first_name} {p.user.last_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          />
        </label>
      </div>

      {canBook && !showForm && (
        <button className="btn btn-primary" onClick={startBooking}>
          Book appointment
        </button>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit appointment" : "Book appointment"}</h2>
          <ErrorState message={formError} />
          <label>
            Patient
            <select
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              disabled={user.role === "patient"}
              required
            >
              <option value="" disabled>
                Select patient
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user.first_name} {p.user.last_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Doctor
            <select
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              required
            >
              <option value="" disabled>
                Select doctor
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user.first_name} {d.user.last_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date &amp; time
            <input
              type="datetime-local"
              value={form.appointment_date}
              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              required
            />
          </label>
          {editingId && (
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {editingId ? "Save" : "Book"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
              <td>{patientName(appt.patient)}</td>
              <td>{doctorName(appt.doctor)}</td>
              <td>{new Date(appt.appointment_date).toLocaleString()}</td>
              <td>
                <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
              </td>
              <td>
                <button className="btn btn-small" onClick={() => startEdit(appt)}>
                  Edit
                </button>
                {appt.status !== "cancelled" && (
                  <button className="btn btn-small" onClick={() => handleCancel(appt.id)}>
                    Cancel
                  </button>
                )}
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(appt.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
