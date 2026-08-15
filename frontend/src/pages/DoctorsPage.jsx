import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as doctorsApi from "../api/doctors";
import { listDepartments } from "../api/departments";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FORM = {
  user_id: "",
  department: "",
  specialization: "",
  phone: "",
  experience: "",
  is_available: true,
};

export default function DoctorsPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const isDoctor = user.role === "doctor";

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ is_available: "", department: "" });

  function load() {
    setLoading(true);
    const params = {};
    if (filters.is_available) params.is_available = filters.is_available;
    if (filters.department) params.department = filters.department;
    Promise.all([doctorsApi.listDoctors(params), listDepartments()])
      .then(([doctorsData, deptData]) => {
        setDoctors(doctorsData);
        setDepartments(deptData);
      })
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  function departmentName(id) {
    return departments.find((d) => d.id === id)?.name ?? id;
  }

  function canEdit(doctor) {
    return isAdmin || (isDoctor && doctor.user.id === user.id);
  }

  function startEdit(doctor) {
    setEditingId(doctor.id);
    setForm({
      user_id: doctor.user.id,
      department: doctor.department,
      specialization: doctor.specialization,
      phone: doctor.phone,
      experience: doctor.experience,
      is_available: doctor.is_available,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const payload = {
      user_id: Number(form.user_id),
      department: Number(form.department),
      specialization: form.specialization,
      phone: form.phone,
      experience: Number(form.experience),
      is_available: form.is_available,
    };
    try {
      if (editingId) {
        await doctorsApi.updateDoctor(editingId, payload);
      } else {
        await doctorsApi.createDoctor(payload);
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
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await doctorsApi.deleteDoctor(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  async function handleToggleAvailability(doctor) {
    try {
      await doctorsApi.setDoctorAvailability(doctor.id, !doctor.is_available);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <h1>Doctors</h1>
      <ErrorState message={error} />

      <div className="filters">
        <label>
          Available
          <select
            value={filters.is_available}
            onChange={(e) => setFilters({ ...filters, is_available: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </label>
        <label>
          Department
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">All</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isAdmin && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit doctor" : "Add doctor"}</h2>
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
            Department
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            >
              <option value="" disabled>
                Select department
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Specialization
            <input
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
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
          <label>
            Experience (years)
            <input
              type="number"
              min="0"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              required
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            />
            Available
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {editingId ? "Save" : "Add"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Specialization</th>
            <th>Phone</th>
            <th>Experience</th>
            <th>Available</th>
            {(isAdmin || isDoctor) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>
                {doctor.user.first_name} {doctor.user.last_name}
              </td>
              <td>{departmentName(doctor.department)}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.phone}</td>
              <td>{doctor.experience} yrs</td>
              <td>{doctor.is_available ? "Yes" : "No"}</td>
              {(isAdmin || isDoctor) && (
                <td>
                  {canEdit(doctor) && (
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => handleToggleAvailability(doctor)}
                      >
                        Toggle availability
                      </button>
                      <button className="btn btn-small" onClick={() => startEdit(doctor)}>
                        Edit
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
