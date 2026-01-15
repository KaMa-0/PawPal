import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuth } from "../auth/authStore";
import "./certifications.css";

interface CertificationRequest {
  requestId: number;
  sitterId: number;
  status: string;
  submissionDate: string;
  sitter: {
    userId: number;
    user: {
      username: string;
      email: string;
    };
  };
}


export default function Certifications() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [requests, setRequests] = useState<CertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (auth?.role !== "ADMIN") {
      setError("Only admins can access this page");
      setLoading(false);
      return;
    }
    fetchCertifications();
  }, [auth]);

  const fetchCertifications = async () => {
    try {
      // Changed to fetch ALL history
      const res = await api.get("/api/certifications/all");
      setRequests(res.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch certifications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await api.post("/api/certifications/approve", { requestId });
      fetchCertifications(); // Refresh list to move item to history
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve");
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await api.post("/api/certifications/reject", { requestId });
      fetchCertifications(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject");
      setActionLoading(null);
    }
  };

  if (!auth || auth.role !== "ADMIN") {
    return <div className="cert-container"><p>Unauthorized</p></div>;
  }

  if (loading) return <div className="cert-container"><p>Loading...</p></div>;

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const pastRequests = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="cert-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Certification Requests</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="cert-section">
        <h2 className="section-title">Pending Requests ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <p className="no-requests">No pending requests</p>
        ) : (
          <div className="cert-list">
            {pendingRequests.map(req => (
              <div key={req.requestId} className="cert-card">
                <div className="cert-info">
                  <h3>{req.sitter.user.username}</h3>
                  <p>Email: {req.sitter.user.email}</p>
                  <p>Submitted: {new Date(req.submissionDate).toLocaleDateString()}</p>
                </div>
                <div className="cert-actions">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleApprove(req.requestId)}
                    disabled={actionLoading === req.requestId}
                  >
                    {actionLoading === req.requestId ? "Processing..." : "Approve"}
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleReject(req.requestId)}
                    disabled={actionLoading === req.requestId}
                  >
                    {actionLoading === req.requestId ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cert-section" style={{ marginTop: '3rem' }}>
        <h2 className="section-title">Request History</h2>
        {pastRequests.length === 0 ? (
          <p className="no-requests">No history available</p>
        ) : (
          <div className="cert-list-history">
            {pastRequests.map(req => (
              <div key={req.requestId} className="cert-card history-card" style={{ opacity: 0.8, backgroundColor: '#f9f9f9' }}>
                <div className="cert-info">
                  <h3>{req.sitter.user.username}</h3>
                  <p>Date: {new Date(req.submissionDate).toLocaleDateString()}</p>
                  <p>Status: <span style={{ fontWeight: 'bold', color: req.status === 'APPROVED' ? 'green' : 'red' }}>{req.status}</span></p>
                  {/* Could show admin who processed it if included in backend response */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

