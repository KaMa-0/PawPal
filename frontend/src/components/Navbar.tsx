import { Link, useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../auth/authStore";
import "./Navbar.css";

export default function Navbar() {
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    PawPal
                </Link>

                {/* 1. If NOT logged in: Show Login/Register buttons */}
                {!auth && (
                    <div className="navbar-links">
                        <Link to="/login" className="nav-btn secondary">
                            Login
                        </Link>
                        <Link to="/register" className="nav-btn primary">
                            Register
                        </Link>
                    </div>
                )}

                {/* 2. If LOGGED IN: Show User Info + Action Buttons */}
                {auth && (
                    <div className="navbar-links">
                        {/* User Info Display */}
                        <span className="user-info">
                            {auth.email} ({auth.role})
                        </span>

                        {/* My Bookings Button - Owners & Sitters Only */}
                        {auth.role !== "ADMIN" && (
                            <Link to="/bookings" className="nav-btn accent">
                                My Bookings
                            </Link>
                        )}

                        {/* Profile Button - Visible to ALL logged in users */}
                        <Link to="/home" className="nav-btn secondary">
                            Profile
                        </Link>

                        {/* Certifications Button - Only for Admin */}
                        {auth.role === "ADMIN" && (
                            <Link to="/certifications" className="nav-btn success">
                                Certifications
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button onClick={handleLogout} className="nav-btn danger">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
