import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../auth/authStore";
import api from "../services/api";
import "./search.css";

// Konstante für die Bundesländer
const AUSTRIA_STATES = [
  "WIEN",
  "NIEDEROESTERREICH",
  "OBEROESTERREICH",
  "SALZBURG",
  "TIROL",
  "VORARLBERG",
  "KAERNTEN",
  "STEIERMARK",
  "BURGENLAND",
] as const;

type AustriaState = typeof AUSTRIA_STATES[number];

type PetSitter = {
  userId: number;
  username: string;
  state: AustriaState;
  petSitter: {
    aboutText?: string;
    averageRating: number;
    petTypes: string[];
  };
};

type Toast = {
  message: string;
  type: "success" | "error";
} | null;

export default function Search() {
  const auth = getAuth();
  const navigate = useNavigate();

  const [sitters, setSitters] = useState<PetSitter[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [state, setState] = useState("");
  const [petType, setPetType] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  async function fetchSitters() {
    setLoading(true);
    const params: any = {};
    if (state) params.state = state;
    if (petType) params.petType = petType;

    try {
      const res = await api.get("/api/users/sitters", { params });
      setSitters(res.data);
    } catch (err) {
      console.error("Failed to load sitters", err);
      showToast("Failed to load sitters via API.", "error");
    } finally {
      setLoading(false);
    }
  }

  // 1. Sitter laden (Einmalig)
  useEffect(() => {
    fetchSitters();
  }, []);

  // 2. Favoriten laden (Nur wenn Owner & ID sich ändert)
  useEffect(() => {
    if (auth?.role === "OWNER" && auth?.userId) {
      api.get("/api/users/favorites/ids")
          .then((res) => setFavoriteIds(res.data))
          .catch((err) => console.error("Failed to load favorites", err));
    }
  }, [auth?.userId]);

  const toggleFavorite = async (e: React.MouseEvent, sitterId: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (!auth || auth.role !== "OWNER") {
      showToast("Only Pet Owners can use favorites.", "error");
      return;
    }

    const isFav = favoriteIds.includes(sitterId);
    const action = isFav ? "remove" : "add";

    if (isFav) {
      setFavoriteIds((prev) => prev.filter((id) => id !== sitterId));
    } else {
      setFavoriteIds((prev) => [...prev, sitterId]);
    }

    try {
      await api.post(`/api/users/favorites/${sitterId}`, { action });
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      showToast("Failed to update favorite.", "error");
    }
  };

  const handleRequestBooking = async (e: React.MouseEvent, sitterId: number) => {
    e.stopPropagation();

    if (!auth || auth.role !== "OWNER") {
      showToast("Only Pet Owners can request bookings.", "error");
      return;
    }

    setSendingRequest(sitterId);

    try {
      await api.post("/api/bookings/request", {
        sitterId,
        details: "Booking requested via search page",
      });
      showToast("Booking request sent successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to send booking request.", "error");
    } finally {
      setSendingRequest(null);
    }
  };

  return (
      <div className="search-container">
        {toast && (
            <div className={`toast-notification toast-${toast.type}`}>
              {toast.message}
            </div>
        )}

        <div className="search-content">
          {/* HEADER */}
          {!auth && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
                <Link to="/login" className="login-button" style={{ marginRight: "0.75rem", textDecoration: "none" }}>
                  Login
                </Link>
                <Link to="/register" className="login-button" style={{ textDecoration: "none" }}>
                  Register
                </Link>
              </div>
          )}

          {auth && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "1.5rem", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ marginRight: "10px", fontWeight: "bold", color: "#555" }}>
              Logged in as: {auth.email} ({auth.role})
            </span>

                {auth.role === "OWNER" && (
                    <Link to="/favorites" className="login-button" style={{ textDecoration: "none", backgroundColor: "#e91e63" }}>
                      Favorites
                    </Link>
                )}

                <Link to="/bookings" className="login-button" style={{ textDecoration: "none", backgroundColor: "#ff9800" }}>
                  My Bookings
                </Link>
                <Link to="/home" className="login-button" style={{ textDecoration: "none" }}>
                  My Profile
                </Link>
                <button onClick={handleLogout} className="login-button" style={{ backgroundColor: "#f44336" }}>
                  Logout
                </button>
              </div>
          )}

          <h1 className="search-title">Find a Pet Sitter</h1>

          {/* FILTER */}
          <div className="search-card">
            <form
                className="search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchSitters();
                }}
            >
              <div className="form-group">
                <label className="form-label">Location</label>
                <select
                    className="form-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {AUSTRIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pet Type</label>
                <select
                    className="form-input"
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                >
                  <option value="">All Pet Types</option>
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="FISH">Fish</option>
                  <option value="REPTILE">Reptile</option>
                </select>
              </div>

              <div className="form-group" style={{ alignSelf: "flex-end" }}>
                <button type="submit" className="login-button">
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* ERGEBNISSE */}
          {loading ? (
              <p className="empty-state">Loading pet sitters…</p>
          ) : sitters.length === 0 ? (
              <p className="empty-state">No pet sitters found.</p>
          ) : (
              <div className="results-grid">
                {sitters.map((sitter) => (
                    <div
                        key={sitter.userId}
                        className="sitter-card"
                        style={{ position: "relative", cursor: "pointer" }}
                        onClick={() => navigate(`/sitters/${sitter.userId}`)}
                    >
                      {auth?.role === "OWNER" && (
                          <button
                              onClick={(e) => toggleFavorite(e, sitter.userId)}
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "none",
                                border: "none",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                          >
                            {favoriteIds.includes(sitter.userId) ? "❤️" : "🤍"}
                          </button>
                      )}

                      <div className="sitter-name">{sitter.username}</div>
                      <div className="sitter-location">{sitter.state}</div>

                      <p className="sitter-text">
                        {sitter.petSitter.aboutText || "No description provided."}
                      </p>

                      <div className="sitter-meta">
                        Pets: {sitter.petSitter.petTypes.join(", ")}
                      </div>

                      {/* NEU: Anzeige 'New' wenn noch keine Reviews da sind, sonst die Zahl */}
                      <div className="sitter-meta">
                        Rating: ⭐ {sitter.petSitter.averageRating > 0
                          ? sitter.petSitter.averageRating.toFixed(1)
                          : "New"}
                      </div>

                      {auth?.role === "OWNER" && (
                          <button
                              className="login-button"
                              style={{ marginTop: "0.75rem", width: "100%", position: "relative", zIndex: 5 }}
                              disabled={sendingRequest === sitter.userId}
                              onClick={(e) => handleRequestBooking(e, sitter.userId)}
                          >
                            {sendingRequest === sitter.userId ? "Sending..." : "Request Booking"}
                          </button>
                      )}
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}