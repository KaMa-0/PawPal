import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, clearAuth } from "../auth/authStore";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
    const auth = getAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Get current page location
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
        setIsMenuOpen(false);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Check if we are on the Home (Dashboard) page
    const isHomePage = location.pathname === "/home";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    PawPal
                </Link>

                {/* Hamburger Menu Button - Only visible on mobile */}
                <button
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Mobile menu overlay */}
                {isMenuOpen && (
                    <div
                        className="navbar-overlay"
                        onClick={closeMenu}
                    />
                )}

                {/* 1. If NOT logged in: Show Login/Register buttons */}
                {!auth && (
                    <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                        <Link to="/login" className="nav-btn secondary" onClick={closeMenu}>
                            Login
                        </Link>
                        <Link to="/register" className="nav-btn primary" onClick={closeMenu}>
                            Register
                        </Link>
                    </div>
                )}

                {/* 2. If LOGGED IN */}
                {auth && (
                    <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                        {/* User Info Display (Always visible) */}
                        <span className="user-info">
                            {auth.email} ({auth.role})
                        </span>

                        {/* Action Buttons: Hide them ONLY on the Home Page */}
                        {!isHomePage && (
                            <>
                                {/* My Bookings Button - Owners & Sitters Only */}
                                {auth.role !== "ADMIN" && (
                                    <Link to="/bookings" className="nav-btn accent" onClick={closeMenu}>
                                        My Bookings
                                    </Link>
                                )}

                                {/* Profile Button */}
                                <Link to="/home" className="nav-btn secondary" onClick={closeMenu}>
                                    Profile
                                </Link>

                                {/* Certifications Button - Only for Admin */}
                                {auth.role === "ADMIN" && (
                                    <Link to="/certifications" className="nav-btn success" onClick={closeMenu}>
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