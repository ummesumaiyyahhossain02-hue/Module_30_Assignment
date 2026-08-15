import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ALL_ROLES = ["admin", "doctor", "patient", "receptionist"];

const LINKS = [
  { to: "/dashboard", label: "Dashboard", roles: ALL_ROLES },
  { to: "/departments", label: "Departments", roles: ALL_ROLES },
  { to: "/doctors", label: "Doctors", roles: ALL_ROLES },
  { to: "/patients", label: "Patients", roles: ALL_ROLES },
  { to: "/appointments", label: "Appointments", roles: ALL_ROLES },
  { to: "/prescriptions", label: "Prescriptions", roles: ["admin", "doctor", "patient"] },
  { to: "/medicines", label: "Medicines", roles: ALL_ROLES },
  { to: "/billing", label: "Billing", roles: ["admin", "receptionist", "patient"] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Hospital Management System</div>
      <div className="navbar-links">
        {LINKS.filter((link) => link.roles.includes(user.role)).map((link) => (
          <NavLink key={link.to} to={link.to} className="navbar-link">
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="navbar-user">
        <span>
          {user.first_name} {user.last_name} ({user.role})
        </span>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </nav>
  );
}
