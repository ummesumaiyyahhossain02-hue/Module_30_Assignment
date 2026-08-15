import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import * as billingApi from "../api/billing";
import { listPatients } from "../api/patients";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const EMPTY_FORM = { patient: "", amount: "" };

export default function BillingPage() {
  const { user } = useAuth();
  const canManage = user.role === "admin" || user.role === "receptionist";

  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([billingApi.listBills(), listPatients()])
      .then(([billData, patientData]) => {
        setBills(billData);
        setPatients(patientData);
      })
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function patientName(id) {
    const pat = patients.find((p) => p.id === id);
    return pat ? `${pat.user.first_name} ${pat.user.last_name}` : id;
  }

  function resetForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await billingApi.createBill({
        patient: Number(form.patient),
        amount: form.amount,
      });
      resetForm();
      load();
    } catch (err) {
      setFormError(parseError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkPaid(id) {
    try {
      await billingApi.markBillPaid(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await billingApi.deleteBill(id);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <h1>Billing</h1>
      <ErrorState message={error} />

      {canManage && !showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Generate bill
        </button>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <h2>Generate bill</h2>
          <ErrorState message={formError} />
          <label>
            Patient
            <select
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
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
            Amount
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              Generate
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
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td>{patientName(bill.patient)}</td>
              <td>{bill.amount}</td>
              <td>
                <span className={`status-badge ${bill.paid ? "status-approved" : "status-pending"}`}>
                  {bill.paid ? "Paid" : "Unpaid"}
                </span>
              </td>
              <td>{new Date(bill.created_at).toLocaleString()}</td>
              {canManage && (
                <td>
                  {!bill.paid && (
                    <button className="btn btn-small" onClick={() => handleMarkPaid(bill.id)}>
                      Mark paid
                    </button>
                  )}
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(bill.id)}>
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
