import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuth } from "../auth/authStore";
import Navbar from "../components/Navbar"; // Added Navbar
import "./submit-certification.css";

export default function SubmitCertification() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (auth?.role !== "SITTER") {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [auth]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/certifications/my-history");
      setHistory(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load certification history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      await api.post("/api/certifications/submit");
      await fetchHistory();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit certification");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!auth || auth.role !== "SITTER") {
    return (
      <div className="submit-cert-page-wrapper">
        <Navbar />
        <div className="submit-cert-content">
          <p className="auth-warning">Only sitters can access this page</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="submit-cert-page-wrapper"><Navbar /><div className="submit-cert-content">Loading...</div></div>;

  const approvedRequest = history.find(h => h.status === "APPROVED");
  const pendingRequest = history.find(h => h.status === "PENDING");
  const isCertified = !!approvedRequest;
  const isPending = !!pendingRequest;

  return (
    <div className="submit-cert-page-wrapper">
      <Navbar /> {/* Navbar at the top */}

      <div className="submit-cert-content">
        <div className="submit-cert-card">

          <div className="cert-card-header">
            <h1 className="page-title">Certification Status</h1>
          </div>

          {/* Status Messages */}
          {isCertified ? (
            <div className="status-message success">
              <h2>✓ You are Verified!</h2>
              <p>Your certification request has been approved. A badge is now displayed on your profile.</p>
              <p className="info-text">Approved on: {new Date(approvedRequest.updatedAt).toLocaleDateString()}</p>
            </div>
          ) : isPending ? (
            <div className="status-message pending">
              <h2>⧖ Verification Pending</h2>
              <p>Your request is currently under review by an admin.</p>
              <p className="info-text">Submitted on: {new Date(pendingRequest.submissionDate).toLocaleDateString()}</p>
            </div>
          ) : (
            /* Submit Form */
            <div className="submit-section">
              <p className="instructions">
                Submit your professional certifications for verification. Once approved, you'll earn a verified badge.
              </p>
              {error && <div className="error-message">{error}</div>}
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="submit-btn"
              >
                {submitLoading ? "Submitting..." : "Submit Certification Request"}
              </button>
            </div>
          )}

          {/* History List */}
          {history.length > 0 && (
            <div className="cert-history-section">
              <h3 className="history-title">Request History</h3>
              <div className="history-list">
                {history.map((req: any) => (
                  <div
                    key={req.requestId}
                    className={`history-item ${req.status.toLowerCase()}`}
                  >
                    <span className="history-date">
                      {new Date(req.submissionDate).toLocaleDateString()}
                    </span>
                    <span className="history-status">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}