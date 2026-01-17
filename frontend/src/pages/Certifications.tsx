import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuth } from "../auth/authStore";
import Navbar from "../components/Navbar"; // Added Navbar
import Footer from "../components/Footer";
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
      fetchCertifications();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve");
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      await api.post("/api/certifications/reject", { requestId });
      fetchCertifications();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject");
      setActionLoading(null);
    }
  };

  if (!auth || auth.role !== "ADMIN") {
    return (
      <div className="cert-page-wrapper">
        <Navbar />
        <div className="cert-content">
          <p className="unauthorized-msg">Unauthorized</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="cert-page-wrapper"><Navbar /><div className="cert-content"><p className="loading-msg">Loading...</p></div></div>;

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const pastRequests = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="cert-page-wrapper">
      <Navbar /> {/* Navbar at the top */}

      <div className="cert-content">
        <div className="cert-container">

          <div className="cert-header">
            <h1 className="cert-title">Certification Requests</h1>
          </div>

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
                      <h3 className="cert-username">{req.sitter.user.username}</h3>
                      <p className="cert-detail">Email: {req.sitter.user.email}</p>
                      <p className="cert-detail">Submitted: {new Date(req.submissionDate).toLocaleDateString()}</p>
                    </div>
                    <div className="cert-actions">
                      <button
                        className="btn btn-approve"
                        onClick={() => handleApprove(req.requestId)}
                        disabled={actionLoading === req.requestId}
                      >
                        {actionLoading === req.requestId ? "..." : "Approve"}
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => handleReject(req.requestId)}
                        disabled={actionLoading === req.requestId}
                      >
                        {actionLoading === req.requestId ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="cert-section history-section">
            <h2 className="section-title">Request History</h2>
            {pastRequests.length === 0 ? (
              <p className="no-requests">No history available</p>
            ) : (
              <div className="cert-list-history">
                {pastRequests.map(req => (
                  <div key={req.requestId} className="cert-card history-card">
                    <div className="cert-info">
                      <h3 className="cert-username">{req.sitter.user.username}</h3>
                      <p className="cert-detail">Date: {new Date(req.submissionDate).toLocaleDateString()}</p>
                      <p className="cert-detail">
                        Status:
                        <span className={`status-badge ${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}