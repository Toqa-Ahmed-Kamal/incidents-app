import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, signInWithEmailAndPassword } from "../firebase";
import AuthButtons from "../components/AuthButtons";


export default function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const navigate = useNavigate();


const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
try {
await signInWithEmailAndPassword(auth, email, password);
navigate("/");
} catch (e) {
console.error(e);
alert(e.message || "Login failed");
} finally {
setLoading(false);
}
};


return (
<div className="container py-4" style={{ maxWidth: 420 }}>
<h3 className="mb-3">Login</h3>
<form onSubmit={handleSubmit} className="mb-3">
<div className="mb-3">
<label className="form-label">Email</label>
<input
type="email"
className="form-control"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
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
/>
</div>
<button className="btn btn-primary w-100" disabled={loading}>
{loading ? "..." : "Login"}
</button>
</form>


<div className="text-center text-muted small mb-2">or</div>
<AuthButtons />


<div className="mt-3 small">
No account? <Link to="/register">Register</Link>
</div>
</div>
);
}