import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, clearAuth } from "../auth/authStore";
import "./Navbar.css";

export default function Navbar() {
    const auth = getAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Get current page location

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    // Check if we are on the Home (Dashboard) page
    const isHomePage = location.pathname === "/home";

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

                {/* 2. If LOGGED IN */}
                {auth && (
                    <div className="navbar-links">
                        {/* User Info Display (Always visible) */}
                        <span className="user-info">
                            {auth.email} ({auth.role})
                        </span>

                        {/* Action Buttons: Hide them ONLY on the Home Page */}
                        {!isHomePage && (
                            <>
                                {/* My Bookings Button - Owners & Sitters Only */}
                                {auth.role !== "ADMIN" && (
                                    <Link to="/bookings" className="nav-btn accent">
                                        My Bookings
                                    </Link>
                                )}

                                {/* Profile Button */}
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
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}