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
import Favorites from "./pages/Favorites";
import SitterProfile from "./pages/SitterProfile";
import { getAuth } from "./auth/authStore";
import "./App.css";

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

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        api.get("/health").catch(() => { });
        api.get("/").then((res) => setMessage(res.data.message)).catch(() => { });
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/search" element={<Search />} />
                <Route path="/sitters/:id" element={<SitterProfile />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Search />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bookings"
                    element={
                        <ProtectedRoute>
                            <Bookings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/favorites"
                    element={
                        <ProtectedRoute>
                            <Favorites />
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

                <Route path="*" element={<Navigate to="/search" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;