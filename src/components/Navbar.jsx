import { Link } from "react-router-dom";
import AvatarInitials from "./AvatarInitials";
import logo from "../assets/logo.png";

export default function Navbar({ user, authLoading, onLogout, theme, onToggleTheme }) {
  return (
    <nav className="navbar bg-body border-bottom shadow-sm sticky-top" style={{ height: 90 }}>
      <div className="container-fluid position-relative d-flex justify-content-between align-items-center">

<Link
  to="/"
  className="navbar-brand d-flex align-items-center gap-2 mb-0 text-decoration-none py-0 lh-1"
  style={{ zIndex: 2 }}
>
  <img
    src={logo}
    alt="Incidents Logo"
    className="navbar-logo"    
  />
</Link>


<div className="position-absolute start-50 translate-middle-x text-center" style={{ zIndex: 1 }}>
  <span className="brand-shine fw-bold d-inline-block">Incidents Map</span>
</div>

        <div className="d-flex align-items-center gap-2" style={{ zIndex: 2 }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onToggleTheme}
            title={theme === "light" ? "Switch to Dark" : "Switch to Light"}
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>

          {authLoading ? (
            <span className="small text-muted">...</span>
          ) : user ? (
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-outline-danger" onClick={onLogout}>
                Logout
              </button>
              <span className="small">{user.displayName || user.email}</span>
              <AvatarInitials user={user} size={26} />
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link className="btn btn-sm btn-primary" to="/register">Register</Link>
              <Link className="btn btn-sm btn-outline-secondary" to="/login">Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
