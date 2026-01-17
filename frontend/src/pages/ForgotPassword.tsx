import { useState } from "react";
import { Link } from "react-router-dom"; // useNavigate unused here, removed
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./login.css";

export default function ForgotPassword() {
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
      <Navbar />
      <div className="login-content">
        <div className="login-card">

          <h1 className="login-title">Reset Password</h1>

          {/* Error Message Display */}
          {error && <div className="error-message">{error}</div>}

          {/* Success Message Display */}
          {success ? (
            <div className="success-message">
              <p><strong>Email sent successfully!</strong></p>
              <p>Check your email for the password reset link. The link will expire in 1 hour.</p>
            </div>
          ) : (
            /* Reset Form */
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

          {/* Back to Login Link */}
          <div className="register-link">
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}