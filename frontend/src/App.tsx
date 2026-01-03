import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import api from "./services/api";
import Login from "./pages/Login";
import "./App.css";
import { getAuth, clearAuth } from "./auth/authStore";
import type { Role } from "./auth/authStore";

/**
 * --------- Small helper components (keep it simple) ----------
 */

function TemporaryHomePage({ message }: { message: string }) {
  const auth = getAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Hello World from PawPal</h1>

      {auth ? (
        <div style={{ marginBottom: "1rem" }}>
          <div>
            Logged in as: <strong>{auth.email}</strong> ({auth.role})
          </div>
          <button
            onClick={() => {
              clearAuth();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: "1rem" }}>
          <a href="/login">Go to Login</a>
        </div>
      )}

      <p>Message from Express backend, connected to Vite + React frontend:</p>
      <p>
        <strong>{message}</strong>
      </p>
    </div>
  );
}

function OwnerHome() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Owner Area</h1>
      <p>Next: Search sitters + create booking request.</p>
    </div>
  );
}

function SitterRequests() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sitter Requests</h1>
      <p>Next: list pending bookings + accept/decline.</p>
    </div>
  );
}

function AdminCertification() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Certification</h1>
      <p>Next: list certification requests + approve/reject.</p>
    </div>
  );
}

/**
 * Redirect users to the correct "home" based on role.
 */
function RoleHomeRedirect() {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;

  if (auth.role === "OWNER") return <Navigate to="/owner" replace />;
  if (auth.role === "SITTER") return <Navigate to="/sitter/requests" replace />;
  if (auth.role === "ADMIN") return <Navigate to="/admin/certification" replace />;

  return <Navigate to="/login" replace />;
}

/**
 * Protect a route; optionally restrict roles.
 */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles?: Role[];
}) {
  const auth = getAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

/**
 * If user is already logged in, prevent visiting /login
 */
function LoginGate({ children }: { children: React.ReactElement }) {
  const auth = getAuth();
  if (auth) return <RoleHomeRedirect />;
  return children;
}

function Forbidden() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>403 - Forbidden</h1>
      <p>You don’t have permission to access this page.</p>
      <a href="/">Back to home</a>
    </div>
  );
}

/**
 * --------- App ----------
 */

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Health check (integration test)
    api.get("/health")
      .then((res) => console.log("Health check OK:", res.data))
      .catch((err) => console.error("Health check failed:", err));

    // Root endpoint test
    api.get("/")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error("Root endpoint failed:", err));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<TemporaryHomePage message={message} />} />

        <Route
          path="/login"
          element={
            <LoginGate>
              <Login />
            </LoginGate>
          }
        />

        {/* Role-based redirect entry */}
        <Route path="/home" element={<RoleHomeRedirect />} />

        {/* Protected */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sitter/requests"
          element={
            <ProtectedRoute allowedRoles={["SITTER"]}>
              <SitterRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/certification"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCertification />
            </ProtectedRoute>
          }
        />

        <Route path="/forbidden" element={<Forbidden />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
