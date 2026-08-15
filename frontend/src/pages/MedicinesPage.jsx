import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as medicinesApi from "../api/medicines";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FORM = { name: "", description: "", unit: "" };

export default function MedicinesPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    medicinesApi
      .listMedicines(search)
      .then((data) => setMedicines(data))
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [search]);

  function startEdit(medicine) {
    setEditingId(medicine.id);
    setForm({ name: medicine.name, description: medicine.description, unit: medicine.unit });
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
    try {
      if (editingId) {
        await medicinesApi.updateMedicine(editingId, form);
      } else {
        await medicinesApi.createMedicine(form);
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
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await medicinesApi.deleteMedicine(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  return (
    <div className="page">
      <h1>Medicines</h1>
      <ErrorState message={error} />

      <div className="filters">
        <label>
          Search
          <input
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {isAdmin && !showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add medicine
        </button>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit medicine" : "Add medicine"}</h2>
          <ErrorState message={formError} />
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            Unit
            <input
              placeholder="e.g. tablet, capsule, ml"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
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

      {loading ? (
        <LoadingState />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Unit</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id}>
                <td>{medicine.name}</td>
                <td>{medicine.description}</td>
                <td>{medicine.unit}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-small" onClick={() => startEdit(medicine)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(medicine.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
