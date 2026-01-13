import { useEffect, useState, type ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import api from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import Search from "./pages/Search";
import Certifications from "./pages/Certifications";
import SubmitCertification from "./pages/SubmitCertification";
import { getAuth } from "./auth/authStore";
import "./App.css";

/**
 * Protects routes that require login.
 * If not authenticated, redirects to /login.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Prevents accessing /login or /register when already logged in.
 */
function LoginGate({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (auth) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Health check or initial data fetch
    api.get("/health").catch(() => { });
    api.get("/").then((res) => setMessage(res.data.message)).catch(() => { });
  }, []);

  return (
    <BrowserRouter>
      {/* The Header is placed here so it is visible on all pages. 
          If you only want it on specific pages, move it inside the Route elements. */}
      <Routes>
        {/* Public Route */}
        <Route path="/search" element={<Search />} />

        {/* Protected Home Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        {/* User Bookings Page */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/* User Home Route (Profile Page) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin Certifications Page */}
        <Route
          path="/certifications"
          element={
            <ProtectedRoute>
              <Certifications />
            </ProtectedRoute>
          }
        />

        {/* Sitter Submit Certification */}
        <Route
          path="/submit-certification"
          element={
            <ProtectedRoute>
              <SubmitCertification />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes (Accessible only if NOT logged in) */}
        <Route
          path="/login"
          element={
            <LoginGate>
              <Login />
            </LoginGate>
          }
        />

        <Route
          path="/register"
          element={
            <LoginGate>
              <Register />
            </LoginGate>
          }
        />

        {/* Fallback - Redirect unknown routes to Search or Login */}
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
