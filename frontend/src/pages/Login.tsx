import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { setAuth } from "../auth/authStore";
import type { Role } from "../auth/authStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./login.css";

type AuthResponse = {
  token: string;
  user: { id: number; email: string; role: Role };
};

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Added '/api' prefix
      const res = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });

      // Converting 'id' (number) to string for storage
      setAuth({
        token: res.data.token,
        userId: String(res.data.user.id),
        email: res.data.user.email,
        role: res.data.user.role,
      });

      nav("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    }
  }

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-content">
        <div className="login-card">

          <h1 className="login-title">Welcome Back</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-button">Login</button>
          </form>

          <div className="register-link">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="register-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}