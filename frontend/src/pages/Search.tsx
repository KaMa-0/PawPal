import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "../auth/authStore";
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
  };
};

export default function Search() {
  const auth = getAuth();

  const [sitters, setSitters] = useState<PetSitter[]>([]);
  const [state, setState] = useState("");
  const [petType, setPetType] = useState("");
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSitters();
  }, []);

  return (
    <div className="search-container">
      <div className="search-content">
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
        <h1 className="search-title">Find a Pet Sitter</h1>

        {/* Filters */}
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
              </select>
            </div>

            <div className="form-group" style={{ alignSelf: "flex-end" }}>
              <button type="submit" className="login-button">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <p className="empty-state">Loading pet sitters…</p>
        ) : sitters.length === 0 ? (
          <p className="empty-state">No pet sitters found.</p>
        ) : (
          <div className="results-grid">
            {sitters.map((sitter) => (
              <div key={sitter.userId} className="sitter-card">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

