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
import Search from "./pages/Search";
import { getAuth, clearAuth } from "./auth/authStore";
import "./App.css";

function TemporaryHomePage({ message }: { message: string }) {
  const auth = getAuth();

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <h1 className="text-4xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">PawPal</h1>

      <div className="mb-6 text-center">
        <p className="mb-4 text-lg">
          Logged in as <strong className="font-semibold">{auth?.email}</strong> <span className="text-sm opacity-75">({auth?.role})</span>
        </p>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md cursor-pointer"
          onClick={() => {
            clearAuth();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Message from backend</p>
        <p className="text-xl font-medium">
          {message || "Loading..."}
        </p>
      </div>
    </div>
  );
}

/**
 * Protects routes that require login
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Prevents accessing /login when already logged in
 */
function LoginGate({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (auth) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/health").catch(() => { });
    api.get("/").then((res) => setMessage(res.data.message));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/search" element={<Search />} />

        {/* Start here */}
        <Route
          path="/"
          element={
          getAuth() ? (
            <Home />
          ) : (
            <Navigate to="/search" replace />
          )}
        />

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

        <Route
          path="/register"
          element={
            <LoginGate>
              <Register />
            </LoginGate>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
