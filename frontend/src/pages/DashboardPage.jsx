import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MODULES = [
  { to: "/departments", label: "Departments", roles: ["admin", "doctor", "patient", "receptionist"] },
  { to: "/doctors", label: "Doctors", roles: ["admin", "doctor", "patient", "receptionist"] },
  { to: "/patients", label: "Patients", roles: ["admin", "doctor", "patient", "receptionist"] },
  { to: "/appointments", label: "Appointments", roles: ["admin", "doctor", "patient", "receptionist"] },
  { to: "/prescriptions", label: "Prescriptions", roles: ["admin", "doctor", "patient"] },
  { to: "/medicines", label: "Medicines", roles: ["admin", "doctor", "patient", "receptionist"] },
  { to: "/billing", label: "Billing", roles: ["admin", "receptionist", "patient"] },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>
        Welcome, {user.first_name} {user.last_name}
      </h1>
      <p className="muted">Role: {user.role}</p>
      <div className="card-grid">
        {MODULES.filter((mod) => mod.roles.includes(user.role)).map((mod) => (
          <Link key={mod.to} to={mod.to} className="dashboard-card">
            {mod.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
