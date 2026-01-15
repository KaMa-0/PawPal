import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuth } from "../auth/authStore";
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
      await fetchHistory(); // Refresh list and status
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit certification");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!auth || auth.role !== "SITTER") {
    return <div className="submit-cert-container"><p>Only sitters can access this page</p></div>;
  }

  if (loading) return <div className="submit-cert-container">Loading...</div>;

  // Determine current status based on history
  // If ANY request is APPROVED, then certified.
  // If ANY request is PENDING, then pending.
  const approvedRequest = history.find(h => h.status === "APPROVED");
  const pendingRequest = history.find(h => h.status === "PENDING");
  const isCertified = !!approvedRequest;
  const isPending = !!pendingRequest;

  return (
    <div className="submit-cert-container">
      <div className="submit-cert-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Certification Status</h1>

        {/* Status Messages */}
        {isCertified ? (
          <div className="success-message">
            <h2>✓ You are Verified!</h2>
            <p>Your certification request has been approved. A badge is now displayed on your profile.</p>
            <p className="info-text">Approved on: {new Date(approvedRequest.updatedAt).toLocaleDateString()}</p>
          </div>
        ) : isPending ? (
          <div className="pending-message" style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>⧖ Verification Pending</h2>
            <p>Your request is currently under review by an admin.</p>
            <p className="info-text">Submitted on: {new Date(pendingRequest.submissionDate).toLocaleDateString()}</p>
          </div>
        ) : (
          /* Show Submit Form if not certified and not pending (e.g. new or rejected) */
          <>
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
          </>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="cert-history" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3>Request History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((req: any) => (
                <div key={req.requestId} style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: req.status === 'APPROVED' ? '#e8f5e9' : req.status === 'REJECTED' ? '#ffebee' : '#f5f5f5',
                  border: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{new Date(req.submissionDate).toLocaleDateString()}</span>
                  <span style={{ fontWeight: 'bold', color: req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'gray' }}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


