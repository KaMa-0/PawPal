import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ChangePassword.css";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/api/auth/change-password", {
                oldPassword,
                newPassword,
                confirmPassword,
            });
            setSuccess("Password changed successfully! Redirecting...");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                navigate("/home");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-card">

                {/* Header Section */}
                <div className="cp-header">
                    <button className="cp-back-btn" onClick={() => navigate("/home")}>
                        ← Back
                    </button>
                    <h1 className="cp-title">Change Password</h1>
                </div>

                <p className="cp-subtitle">Ensure your account is secure by using a strong password.</p>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="cp-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="oldPassword">Current Password</label>
                        <input
                            className="form-input"
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="newPassword">New Password</label>
                        <input
                            className="form-input"
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min. 8 chars)"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            className="form-input"
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button type="submit" className="cp-submit-btn" disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}