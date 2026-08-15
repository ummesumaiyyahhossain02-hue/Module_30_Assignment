import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as departmentsApi from "../api/departments";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FORM = { name: "", description: "" };

export default function DepartmentsPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    departmentsApi
      .listDepartments()
      .then((data) => setDepartments(data))
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(dept) {
    setEditingId(dept.id);
    setForm({ name: dept.name, description: dept.description });
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
    try {
      if (editingId) {
        await departmentsApi.updateDepartment(editingId, form);
      } else {
        await departmentsApi.createDepartment(form);
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
    if (!window.confirm("Delete this department?")) return;
    try {
      await departmentsApi.deleteDepartment(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <h1>Departments</h1>
      <ErrorState message={error} />

      {isAdmin && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit department" : "Add department"}</h2>
          <ErrorState message={formError} />
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
            <th>Description</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td>{dept.name}</td>
              <td>{dept.description}</td>
              {isAdmin && (
                <td>
                  <button className="btn btn-small" onClick={() => startEdit(dept)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(dept.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
