import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuth } from "../auth/authStore";
import "./submit-certification.css";

export default function SubmitCertification() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (auth?.role !== "SITTER") {
      setError("Only sitters can submit certifications");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/certifications/submit");
      setSubmitted(true);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit certification");
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  if (!auth || auth.role !== "SITTER") {
    return <div className="submit-cert-container"><p>Only sitters can access this page</p></div>;
  }

  return (
    <div className="submit-cert-container">
      <div className="submit-cert-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Submit Certification Request</h1>

        {submitted ? (
          <div className="success-message">
            <h2>✓ Request Submitted</h2>
            <p>Your certification request has been submitted for admin review.</p>
            <p className="info-text">You'll be notified once the admin reviews your request.</p>
          </div>
        ) : (
          <>
            <p className="instructions">
              Submit your professional certifications for admin verification. Once approved, you'll earn a certification ribbon on your profile.
            </p>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Submitting..." : "Submit Certification Request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

