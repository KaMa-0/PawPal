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
    fetchPendingCertifications();
  }, [auth]);

  const fetchPendingCertifications = async () => {
    try {
      const res = await api.get("/api/certifications/pending");
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
      setRequests(requests.filter(r => r.requestId !== requestId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await api.post("/api/certifications/reject", { requestId });
      setRequests(requests.filter(r => r.requestId !== requestId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  if (!auth || auth.role !== "ADMIN") {
    return <div className="cert-container"><p>Unauthorized</p></div>;
  }

  if (loading) return <div className="cert-container"><p>Loading...</p></div>;

  return (
    <div className="cert-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Certification Requests</h1>
      {error && <div className="error-message">{error}</div>}

      {requests.length === 0 ? (
        <p className="no-requests">No pending certification requests</p>
      ) : (
        <div className="cert-list">
          {requests.map(req => (
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
  );
}

