import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import { listDepartments } from "../api/departments";
import { createDoctor } from "../api/doctors";
import { createPatient } from "../api/patients";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";

export default function CompleteProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(user?.role === "doctor");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    department: "",
    specialization: "",
    phone: "",
    experience: "",
    is_available: true,
  });
  const [patientForm, setPatientForm] = useState({
    age: "",
    gender: "",
    blood_group: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (user?.role === "doctor") {
      listDepartments()
        .then((data) => setDepartments(data))
        .catch((err) => setError(parseError(err).message))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return null;

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createDoctor({
        user_id: user.id,
        department: Number(doctorForm.department),
        specialization: doctorForm.specialization,
        phone: doctorForm.phone,
        experience: Number(doctorForm.experience),
        is_available: doctorForm.is_available,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePatientSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createPatient({
        user_id: user.id,
        age: Number(patientForm.age),
        gender: patientForm.gender,
        blood_group: patientForm.blood_group,
        address: patientForm.address,
        phone: patientForm.phone,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="auth-page">
      {user.role === "doctor" ? (
        <form className="auth-form" onSubmit={handleDoctorSubmit}>
          <h1>Complete Your Doctor Profile</h1>
          <ErrorState message={error} />
          <label>
            Department
            <select
              value={doctorForm.department}
              onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
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
              value={doctorForm.specialization}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, specialization: e.target.value })
              }
              required
            />
          </label>
          <label>
            Phone
            <input
              value={doctorForm.phone}
              onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
              required
            />
          </label>
          <label>
            Experience (years)
            <input
              type="number"
              min="0"
              value={doctorForm.experience}
              onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
              required
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={doctorForm.is_available}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, is_available: e.target.checked })
              }
            />
            Available for appointments
          </label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save profile"}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handlePatientSubmit}>
          <h1>Complete Your Patient Profile</h1>
          <ErrorState message={error} />
          <label>
            Age
            <input
              type="number"
              min="0"
              value={patientForm.age}
              onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
              required
            />
          </label>
          <label>
            Gender
            <input
              value={patientForm.gender}
              onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              required
            />
          </label>
          <label>
            Blood group
            <input
              value={patientForm.blood_group}
              onChange={(e) =>
                setPatientForm({ ...patientForm, blood_group: e.target.value })
              }
              required
            />
          </label>
          <label>
            Address
            <input
              value={patientForm.address}
              onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              required
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save profile"}
          </button>
        </form>
      )}
    </div>
  );
}
