import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as patientsApi from "../api/patients";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FORM = {
  user_id: "",
  age: "",
  gender: "",
  blood_group: "",
  address: "",
  phone: "",
};

export default function PatientsPage() {
  const { user } = useAuth();
  const canManageAny = user.role === "admin" || user.role === "receptionist";
  const isPatient = user.role === "patient";

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    patientsApi
      .listPatients()
      .then((data) => setPatients(data))
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function canEdit(patient) {
    return canManageAny || (isPatient && patient.user.id === user.id);
  }

  function startEdit(patient) {
    setEditingId(patient.id);
    setShowForm(true);
    setForm({
      user_id: patient.user.id,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group,
      address: patient.address,
      phone: patient.phone,
    });
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
      age: Number(form.age),
      gender: form.gender,
      blood_group: form.blood_group,
      address: form.address,
      phone: form.phone,
    };
    if (!editingId) payload.user_id = Number(form.user_id);
    try {
      if (editingId) {
        await patientsApi.updatePatient(editingId, payload);
      } else {
        await patientsApi.createPatient(payload);
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
    if (!window.confirm("Delete this patient?")) return;
    try {
      await patientsApi.deletePatient(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <h1>Patients</h1>
      <ErrorState message={error} />

      {canManageAny && !showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add patient
        </button>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit patient" : "Add patient"}</h2>
          <ErrorState message={formError} />
          {!editingId && (
            <label>
              User ID
              <input
                type="number"
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                required
              />
            </label>
          )}
          <label>
            Age
            <input
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
            />
          </label>
          <label>
            Gender
            <input
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
            />
          </label>
          <label>
            Blood group
            <input
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
              required
            />
          </label>
          <label>
            Address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {editingId ? "Save" : "Add"}
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
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Blood group</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                {patient.user.first_name} {patient.user.last_name}
              </td>
              <td>{patient.age}</td>
              <td>{patient.gender}</td>
              <td>{patient.blood_group}</td>
              <td>{patient.address}</td>
              <td>{patient.phone}</td>
              <td>
                {canEdit(patient) && (
                  <button className="btn btn-small" onClick={() => startEdit(patient)}>
                    Edit
                  </button>
                )}
                {canManageAny && (
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(patient.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
