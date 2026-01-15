import { Link, useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../auth/authStore";

export default function Navbar() {
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <nav className="navbar" style={{ padding: "1rem 2rem", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
                <Link to="/" style={{ textDecoration: "none", fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                    PawPal
                </Link>

                {/* 1. If NOT logged in: Show Login/Register buttons */}
                {!auth && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Link to="/login" className="login-button" style={{ textDecoration: "none" }}>
                            Login
                        </Link>
                        <Link to="/register" className="login-button" style={{ textDecoration: "none" }}>
                            Register
                        </Link>
                    </div>
                )}

                {/* 2. If LOGGED IN: Show User Info + Action Buttons */}
                {auth && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        {/* User Info Display */}
                        <span style={{ marginRight: "10px", fontWeight: "bold", color: "#555" }}>
                            {auth.email} ({auth.role})
                        </span>

                        {/* My Bookings Button - Owners & Sitters Only */}
                        {auth.role !== "ADMIN" && (
                            <Link to="/bookings" className="login-button" style={{ textDecoration: "none", backgroundColor: "#ff9800" }}>
                                My Bookings
                            </Link>
                        )}

                        {/* Profile Button - Visible to ALL logged in users */}
                        <Link to="/home" className="login-button" style={{ textDecoration: "none" }}>
                            Profile
                        </Link>

                        {/* Certifications Button - Only for Admin */}
                        {auth.role === "ADMIN" && (
                            <Link to="/certifications" className="login-button" style={{ textDecoration: "none", backgroundColor: "#4caf50" }}>
                                Certifications
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button onClick={handleLogout} className="login-button" style={{ backgroundColor: "#f44336" }}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
