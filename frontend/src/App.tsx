/* Datei: `public/index.html` (Head)
   Füge diese Zeile in den <head> ein oder verschiebe deine favicon-Datei nach /public.
   <link rel="icon" href="/favicon/favicon.ico" />
*/

import { useEffect, useState, type ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import api from "./services/api";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import Search from "./pages/Search";
import SitterProfile from "./pages/SitterProfile";
import Certifications from "./pages/Certifications";
import SubmitCertification from "./pages/SubmitCertification";
import ChangePassword from "./pages/ChangePassword";
import Favorites from "./pages/Favorites";
import { getAuth } from "./auth/authStore";
import "./App.css";

/* Route-Guards */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}
function LoginGate({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (auth) return <Navigate to="/" replace />;
  return children;
}

/* Helper: favicon setzen (Cache-Busting optional) */
function setFavicon(url: string) {
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

/* Component: Title + Favicon based on current route */
function TitleFavicon() {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "PawPal — Home",
      "/search": "PawPal — Suche",
      "/home": "PawPal — Home",
      "/login": "PawPal — Login",
      "/register": "PawPal — Registrierung",
    };
    document.title = titles[location.pathname] ?? "PawPal";
    // Pfad anpassen, z.B. '/favicon/favicon.ico' oder '/favicon.ico' wenn du es ins Public-Root legst
    setFavicon("/favicon/favicon.ico?v=1");
  }, [location.pathname]);

  return null;
}

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/health").catch(() => { });
    api.get("/").then((res) => setMessage(res.data.message)).catch(() => { });
  }, []);

  return (
    <BrowserRouter>
      <TitleFavicon />
      <Routes>
        <Route path="/search" element={<Search />} />

        {/* Changed from Protected Search to Public LandingPage */}
        <Route path="/" element={<LandingPage />} />

        {/* User Bookings Page */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/* User Favorites Page */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
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

        {/* Public Sitter Profile Route - Accessible to everyone */}
        <Route path="/sitter/:id" element={<SitterProfile />} />

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

        {/* Change Password Route */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
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

        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
