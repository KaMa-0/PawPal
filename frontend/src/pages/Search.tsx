import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../auth/authStore";
import api from "../services/api";
import "./search.css";

type AustriaState =
    | "WIEN"
    | "NIEDEROESTERREICH"
    | "OBEROESTERREICH"
    | "SALZBURG"
    | "TIROL"
    | "VORARLBERG"
    | "KAERNTEN"
    | "STEIERMARK"
    | "BURGENLAND";

type PetSitter = {
  userId: number;
  username: string;
  state: AustriaState;
  petSitter: {
    aboutText?: string;
    averageRating: number;
    petTypes: string[];
    certificationRequests: Array<{
      requestId: number;
      status: string;
    }>;
  };
};

// Typ für unsere Benachrichtigung
type Toast = {
  message: string;
  type: "success" | "error";
} | null;

export default function Search() {
  const auth = getAuth();
  const navigate = useNavigate();

  const [sitters, setSitters] = useState<PetSitter[]>([]);
  const [state, setState] = useState("");
  const [petType, setPetType] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Hilfsfunktion um Alerts zu ersetzen
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Nach 3 Sekunden automatisch ausblenden
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
        details: "Booking requested via search page"
      });
      showToast("Booking request sent successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to send booking request.", "error");
    } finally {
      setSendingRequest(null);
    }
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  return (
      <div className="search-container">

        {/* Toast Anzeige (nur sichtbar wenn toast state existiert) */}
        {toast && (
            <div className={`toast-notification toast-${toast.type}`}>
              {toast.message}
            </div>
        )}

        <div className="search-content">

          {/* --- HEADER SECTION --- */}
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

          {/* Filters Section */}
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
                  {[
                    "WIEN",
                    "NIEDEROESTERREICH",
                    "OBEROESTERREICH",
                    "SALZBURG",
                    "TIROL",
                    "VORARLBERG",
                    "KAERNTEN",
                    "STEIERMARK",
                    "BURGENLAND",
                  ].map((s) => (
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
            
            {/* Certifications Button - Only for Admin */}
            {auth.role === "ADMIN" && (
              <Link to="/certifications" className="login-button" style={{ textDecoration: "none", backgroundColor: "#4caf50" }}>
                Certifications
              </Link>
            )}

            {/* Logout Button */}
            <button onClick={handleLogout} className="login-button" style={{ backgroundColor: "#f44336" }}>
              Logout
            </button>
          </div>

          {/* Results Grid */}
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
                    >
                      <div className="sitter-name">{sitter.username}</div>
                      <div className="sitter-location">{sitter.state}</div>

                      <p className="sitter-text">
                        {sitter.petSitter.aboutText || "No description provided."}
                      </p>

                      <div className="sitter-meta">
                        Pets: {sitter.petSitter.petTypes.join(", ")}
                      </div>
                      <div className="sitter-meta">
                        Rating: ⭐ {sitter.petSitter.averageRating.toFixed(1)}
                      </div>

                      {/* Show Request Button only for Owners */}
                      {auth?.role === "OWNER" && (
                          <button
                              className="login-button"
                              style={{ marginTop: "0.75rem", width: "100%" }}
                              disabled={sendingRequest === sitter.userId}
                              onClick={(e) => handleRequestBooking(e, sitter.userId)}
                          >
                            {sendingRequest === sitter.userId ? "Sending..." : "Request Booking"}
                          </button>
                      )}
                    </div>
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

        {/* Results Grid */}
        {loading ? (
          <p className="empty-state">Loading pet sitters…</p>
        ) : sitters.length === 0 ? (
          <p className="empty-state">No pet sitters found.</p>
        ) : (
          <div className="results-grid">
            {sitters.map((sitter) => (
              <div key={sitter.userId} className="sitter-card">
                {sitter.petSitter.certificationRequests.length > 0 && (
                  <div className="certification-ribbon">✓ Certified</div>
                )}
                <div className="sitter-name">{sitter.username}</div>
                <div className="sitter-location">{sitter.state}</div>

                <p className="sitter-text">
                  {sitter.petSitter.aboutText || "No description provided."}
                </p>

                <div className="sitter-meta">
                  Pets: {sitter.petSitter.petTypes.join(", ")}
                </div>
                <div className="sitter-meta">
                  Rating: ⭐ {sitter.petSitter.averageRating.toFixed(1)}
                </div>

                {/* Show Request Button only for Owners */}
                {auth?.role === "OWNER" && (
                  <button
                    className="login-button"
                    style={{ marginTop: "0.75rem", width: "100%" }}
                    disabled={sendingRequest === sitter.userId}
                    onClick={() => handleRequestBooking(sitter.userId)}
                  >
                    {sendingRequest === sitter.userId ? "Sending..." : "Request Booking"}
                  </button>
                )}
              </div>
          )}
        </div>
      </div>
  );
}