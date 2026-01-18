import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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

                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>

                    {/* Common Navigation Links (Visible to all or restricted) */}

                    {/* Find a Sitter - Visible to everyone except maybe strict Admin, but usually good for all */}
                    <NavLink to="/search" className="nav-link" onClick={closeMenu}>
                        Find a Sitter
                    </NavLink>
                    <hr className="nav-divider" />

                    {/* 1. If NOT logged in: Show Login/Register buttons */}
                    {!auth && (
                        <>
                            <Link to="/login" className="nav-btn secondary" onClick={closeMenu}>
                                Login
                            </Link>
                            <Link to="/register" className="nav-btn primary" onClick={closeMenu}>
                                Register
                            </Link>
                        </>
                    )}

                    {/* 2. If LOGGED IN */}
                    {auth && (
                        <>
                            {/* Navigation Links (Text based) */}
                            {auth.role !== "ADMIN" && (
                                <>
                                    <NavLink to="/bookings" className="nav-link" onClick={closeMenu}>
                                        My Bookings
                                    </NavLink>
                                    <hr className="nav-divider" />
                                </>
                            )}

                            {/* Favorites Link - Only for Pet Owners */}
                            {auth.role === "OWNER" && (
                                <>
                                    <NavLink to="/favorites" className="nav-link" onClick={closeMenu}>
                                        Favorites
                                    </NavLink>
                                    <hr className="nav-divider" />
                                </>
                            )}

                            {auth.role === "ADMIN" && (
                                <>
                                    <NavLink to="/certifications" className="nav-link" onClick={closeMenu}>
                                        Certifications
                                    </NavLink>
                                    <hr className="nav-divider" />
                                </>
                            )}

                            {/* Profile Link - Treat as Nav Link or Icon in future, simple text for now */}
                            <NavLink to="/home" className="nav-link" onClick={closeMenu}>
                                Profile
                            </NavLink>

                            {/* Separator / User Info */}
                            <div className="nav-separator"></div>

                            <span className="user-info">
                                {auth.email}
                                <span className="user-role-badge">{auth.role}</span>
                            </span>

                            {/* Actions */}
                            <button onClick={handleLogout} className="nav-btn ghost">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
