import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import Navbar from "../components/Navbar";
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

export default function Search() {
  const auth = getAuth();

  const location = useLocation();

  const [sitters, setSitters] = useState<PetSitter[]>([]);
  const [state, setState] = useState("");
  const [petType, setPetType] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);

  // Initialize filters from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramState = params.get("state");
    const paramPetType = params.get("petType");
    const paramMinRating = params.get("minRating");

    if (paramState) setState(paramState);
    if (paramPetType) setPetType(paramPetType);
    if (paramMinRating) setMinRating(Number(paramMinRating));

    // Auto-fetch if params exist, otherwise fetch all (default existing behavior) is handled by the fetchSitters call below 
    // BUT we need to make sure state is updated before fetching. 
    // Ideally, we should fetch inside this effect or a separate effect that depends on state.
    // However, the original code had a separate useEffect for fetching on mount.
    // Let's modify fetchSitters to accept arguments or rely on state, but state updates are async.
    // Better strategy: Pass the values to fetchSitters directly if we have them, OR wait for state to settle.
    // Simplest: just call fetchSitters with the extracted values.

    fetchSitters({
      state: paramState || "",
      petType: paramPetType || "",
      minRating: paramMinRating ? Number(paramMinRating) : 0
    });

  }, [location.search]);

  // Combined fetch function that takes optional overrides
  async function fetchSitters(overrides?: { state: string; petType: string; minRating: number }) {
    setLoading(true);
    const params: any = {};

    const currentState = overrides ? overrides.state : state;
    const currentPetType = overrides ? overrides.petType : petType;
    const currentMinRating = overrides ? overrides.minRating : minRating;

    if (currentState) params.state = currentState;
    if (currentPetType) params.petType = currentPetType;
    if (currentMinRating > 0) params.minRating = currentMinRating;

    try {
      const res = await api.get("/api/users/sitters", { params });
      setSitters(res.data);
    } catch (err) {
      console.error("Failed to load sitters", err);
    } finally {
      setLoading(false);
    }
  }

  // Send booking request to sitter (Only for Owners)
  const handleRequestBooking = async (sitterId: number) => {
    if (!auth || auth.role !== "OWNER") {
      alert("Only Pet Owners can request bookings.");
      return;
    }

    setSendingRequest(sitterId);

    try {
      await api.post("/api/bookings/request", {
        sitterId,
        details: "Booking requested via search page"
      });
      alert("Booking request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send booking request");
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-container">
        <div className="search-content">

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

              <div className="form-group">
                <label className="form-label">Minimum Rating</label>
                <select
                  className="form-input"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                >
                  <option value="0">Any Rating</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
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
                  {sitter.petSitter.certificationRequests.some(r => r.status === "APPROVED") && (
                    <div className="certification-ribbon">✓ Certified</div>
                  )}
                  <div className="sitter-name">
                    <Link to={`/sitter/${sitter.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {sitter.username}
                    </Link>
                  </div>
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

                  <Link to={`/sitter/${sitter.userId}`} className="login-button" style={{ display: 'block', textAlign: 'center', marginTop: '10px', textDecoration: 'none', backgroundColor: '#607d8b' }}>
                    View Profile
                  </Link>

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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}