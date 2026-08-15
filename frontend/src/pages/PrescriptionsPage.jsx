import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as prescriptionsApi from "../api/prescriptions";
import { listAppointments } from "../api/appointments";
import { listDoctors } from "../api/doctors";
import { listPatients } from "../api/patients";
import { listMedicines } from "../api/medicines";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_ROW = { medicine: "", dosage: "", duration: "" };
const EMPTY_FORM = { appointment: "", diagnosis: "", notes: "" };

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const canWrite = user.role === "admin" || user.role === "doctor";

  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      prescriptionsApi.listPrescriptions(),
      listAppointments(),
      listDoctors(),
      listPatients(),
      listMedicines(),
    ])
      .then(([presData, apptData, doctorData, patientData, medData]) => {
        setPrescriptions(presData);
        setAppointments(apptData);
        setDoctors(doctorData);
        setPatients(patientData);
        setMedicines(medData);
      })
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function doctorName(id) {
    const doc = doctors.find((d) => d.id === id);
    return doc ? `Dr. ${doc.user.first_name} ${doc.user.last_name}` : id;
  }

  function patientName(id) {
    const pat = patients.find((p) => p.id === id);
    return pat ? `${pat.user.first_name} ${pat.user.last_name}` : id;
  }

  function medicineName(id) {
    return medicines.find((m) => m.id === id)?.name ?? id;
  }

  function appointmentLabel(id) {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return `Appointment #${id}`;
    return `${patientName(appt.patient)} with ${doctorName(appt.doctor)} on ${new Date(
      appt.appointment_date
    ).toLocaleString()}`;
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setRows([{ ...EMPTY_ROW }]);
    setShowForm(true);
  }

  function startEdit(prescription) {
    setEditingId(prescription.id);
    setForm({
      appointment: prescription.appointment,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
    });
    setRows(
      prescription.prescription_medicines.map((pm) => ({
        medicine: pm.medicine,
        dosage: pm.dosage,
        duration: pm.duration,
      }))
    );
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setRows([{ ...EMPTY_ROW }]);
    setFormError(null);
  }

  function updateRow(index, field, value) {
    setRows(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows([...rows, { ...EMPTY_ROW }]);
  }

  function removeRow(index) {
    setRows(rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const payload = {
      appointment: Number(form.appointment),
      diagnosis: form.diagnosis,
      notes: form.notes,
      prescription_medicines: rows.map((row) => ({
        medicine: Number(row.medicine),
        dosage: row.dosage,
        duration: row.duration,
      })),
    };
    try {
      if (editingId) {
        await prescriptionsApi.updatePrescription(editingId, payload);
      } else {
        await prescriptionsApi.createPrescription(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setFormError(parseError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this prescription?")) return;
    try {
      await prescriptionsApi.deletePrescription(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <h1>Prescriptions</h1>
      <ErrorState message={error} />

      {canWrite && !showForm && (
        <button className="btn btn-primary" onClick={startCreate}>
          New prescription
        </button>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit prescription" : "New prescription"}</h2>
          <ErrorState message={formError} />
          <label>
            Appointment
            <select
              value={form.appointment}
              onChange={(e) => setForm({ ...form, appointment: e.target.value })}
              required
            >
              <option value="" disabled>
                Select appointment
              </option>
              {appointments.map((appt) => (
                <option key={appt.id} value={appt.id}>
                  {appointmentLabel(appt.id)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Diagnosis
            <textarea
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              required
            />
          </label>
          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              required
            />
          </label>

          <h3>Medicines</h3>
          {rows.map((row, index) => (
            <div className="medicine-row" key={index}>
              <select
                value={row.medicine}
                onChange={(e) => updateRow(index, "medicine", e.target.value)}
                required
              >
                <option value="" disabled>
                  Select medicine
                </option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Dosage (e.g. 1 tablet twice daily)"
                value={row.dosage}
                onChange={(e) => updateRow(index, "dosage", e.target.value)}
                required
              />
              <input
                placeholder="Duration (e.g. 7 days)"
                value={row.duration}
                onChange={(e) => updateRow(index, "duration", e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-small btn-danger"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addRow}>
            Add medicine
          </button>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {editingId ? "Save" : "Create"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="prescription-history">
        <h2>History</h2>
        {prescriptions.map((prescription) => (
          <div className="prescription-card" key={prescription.id}>
            <div className="prescription-card-header">
              <strong>{appointmentLabel(prescription.appointment)}</strong>
              {canWrite && (
                <div>
                  <button className="btn btn-small" onClick={() => startEdit(prescription)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(prescription.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p>
              <strong>Diagnosis:</strong> {prescription.diagnosis}
            </p>
            {prescription.notes && (
              <p>
                <strong>Notes:</strong> {prescription.notes}
              </p>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.prescription_medicines.map((pm) => (
                  <tr key={pm.id}>
                    <td>{medicineName(pm.medicine)}</td>
                    <td>{pm.dosage}</td>
                    <td>{pm.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
