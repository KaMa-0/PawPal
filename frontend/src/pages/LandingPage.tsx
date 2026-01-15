import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./LandingPage.css";

export default function LandingPage() {
    const navigate = useNavigate();
    const [state, setState] = useState("");
    const [petType, setPetType] = useState("");
    const [minRating, setMinRating] = useState(0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (state) params.append("state", state);
        if (petType) params.append("petType", petType);
        if (minRating > 0) params.append("minRating", minRating.toString());

        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="landing-container">
            <Navbar />

            <div className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Find the Perfect Companion for Your Pet</h1>
                    <p className="hero-subtitle">Trusted pet sitters in your area, just a click away.</p>

                    <form className="search-widget" onSubmit={handleSearch}>
                        <div className="widget-group">
                            <label className="widget-label">Location</label>
                            <select
                                className="widget-select"
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
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="widget-group">
                            <label className="widget-label">Pet Type</label>
                            <select
                                className="widget-select"
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

                        <div className="widget-group">
                            <label className="widget-label">Minimum Rating</label>
                            <select
                                className="widget-select"
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

                        <button type="submit" className="search-btn">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
