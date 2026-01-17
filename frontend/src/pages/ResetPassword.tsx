import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { setAuth } from "../auth/authStore";
import type { Role } from "../auth/authStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./login.css";

type ResetResponse = {
  token: string;
  user: { id: number; email: string; role: Role };
};

export default function ResetPassword() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      setTokenValid(false);
    }
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<ResetResponse>("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      // Auto-login user after password reset
      setAuth({
        token: res.data.token,
        userId: String(res.data.user.id),
        email: res.data.user.email,
        role: res.data.user.role,
      });

      setSuccess(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        nav("/");
      }, 2000);
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      setError(err?.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  // View for invalid token
  if (!tokenValid) {
    return (
      <div className="login-container">
        <Navbar />
        <div className="login-content">
          <div className="login-card">
            <h1 className="login-title">Reset Password</h1>
            <div className="error-message">
              {error}
            </div>
            <div className="register-link">
              <Link to="/forgot-password">Request a new reset link</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-content">
        <div className="login-card">

          <h1 className="login-title">Reset Password</h1>

          {error && <div className="error-message">{error}</div>}

          {success ? (
            /* Using the .success-message class defined in login.css */
            <div className="success-message">
              <p><strong>Password reset successfully!</strong></p>
              <p>You will be redirected to the home page shortly...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="register-link">
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}