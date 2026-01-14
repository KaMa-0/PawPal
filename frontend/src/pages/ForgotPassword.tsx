import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./login.css";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      setError(err?.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Reset Password</h1>

        {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}

        {success ? (
          <div style={{ color: '#4caf50', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '4px', marginBottom: '15px' }}>
            <p><strong>Email sent successfully!</strong></p>
            <p>Check your email for the password reset link. The link will expire in 1 hour.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="register-link" style={{ marginTop: '1.5rem' }}>
          Remember your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

