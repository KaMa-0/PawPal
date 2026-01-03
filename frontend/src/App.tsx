import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import api from "./services/api";
import Login from "./pages/Login";
import { getAuth, clearAuth } from "./auth/authStore";
import "./App.css";

function TemporaryHomePage({ message }: { message: string }) {
  const auth = getAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>PawPal</h1>

      <div style={{ marginBottom: "1rem" }}>
        Logged in as <strong>{auth?.email}</strong> ({auth?.role})
        <br />
        <button
          onClick={() => {
            clearAuth();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      <p>Message from backend:</p>
      <p>
        <strong>{message}</strong>
      </p>
    </div>
  );
}

/**
 * Protects routes that require login
 */
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Prevents accessing /login when already logged in
 */
function LoginGate({ children }: { children: JSX.Element }) {
  const auth = getAuth();
  if (auth) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/health").catch(() => {});
    api.get("/").then((res) => setMessage(res.data.message));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Start here */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TemporaryHomePage message={message} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <LoginGate>
              <Login />
            </LoginGate>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
