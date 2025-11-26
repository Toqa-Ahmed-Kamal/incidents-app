import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, createUserWithEmailAndPassword, updateProfile } from "../firebase";
import AuthButtons from "../components/AuthButtons";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      if (trimmedName) {
        try {
          await updateProfile(cred.user, { displayName: trimmedName });
        } catch (err) {
          console.warn("updateProfile failed:", err);
        }
      }

      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
      alert(e.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && email && password; 

  return (
    <div className="container py-4" style={{ maxWidth: 420 }}>
      <h3 className="mb-3">Register</h3>

      <form onSubmit={handleSubmit} className="mb-3">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            placeholder="(optional)"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={!canSubmit}>
          {loading ? "..." : "Create account"}
        </button>
      </form>

      <div className="text-center text-muted small mb-2">or</div>
      <AuthButtons />

      <div className="mt-3 small">
        Have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
