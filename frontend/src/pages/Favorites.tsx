import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../services/api";
import Navbar from "../components/Navbar";
import FavoriteButton from "../components/FavoriteButton";
import { getAuth } from "../auth/authStore";
import "./search.css"; // Reuse search card styles

// Define types locally if not shared, or import from common types
interface FavoriteSitter {
    userId: number;
    username: string;
    state: string;
    profileImages: { imageUrl: string; isAvatar: boolean }[];
    petSitter: {
        aboutText?: string;
        averageRating: number;
        petTypes: string[];
        certificationRequests: { status: string }[];
    };
    isFavorited: boolean;
}

const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
};

export default function Favorites() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<FavoriteSitter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            navigate("/login");
            return;
        }
        if (auth.role !== "OWNER") {
            navigate("/"); // Or some error page
            return;
        }

        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.userId, navigate]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/users/me/favorites");
            setFavorites(res.data);
        } catch (err) {
            console.error("Failed to fetch favorites", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (sitterId: number) => {
        // Optimistically remove from list upon successful toggle (which is actually Remove action in this context)
        setFavorites(prev => prev.filter(f => f.userId !== sitterId));
    };

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-container">
                <h1 className="search-title">My Favorites ❤️</h1>

                {loading ? (
                    <p className="empty-state">Loading favorites...</p>
                ) : favorites.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't added any favorites yet.</p>
                        <Link to="/search" className="search-button-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
                            Find Pet Sitters
                        </Link>
                    </div>
                ) : (
                    <div className="results-grid">
                        {favorites.map((sitter) => {
                            const avatar = sitter.profileImages.find(img => img.isAvatar) || sitter.profileImages[0];
                            const isCertified = sitter.petSitter.certificationRequests.some(r => r.status === "APPROVED");

                            return (
                                <div key={sitter.userId} className="hero-card">
                                    {/* Reuse Hero Card Logic from Search */}
                                    <div className="hero-image-container">
                                        {avatar ? (
                                            <img
                                                src={resolveImageUrl(avatar.imageUrl)}
                                                alt={sitter.username}
                                                className="hero-image"
                                            />
                                        ) : (
                                            <div className="hero-placeholder">
                                                {sitter.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {isCertified && (
                                            <div className="card-badge">✓ Certified</div>
                                        )}
                                    </div>

                                    <div className="hero-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Link to={`/sitter/${sitter.userId}`} className="hero-name">
                                                {sitter.username}
                                            </Link>
                                            <FavoriteButton
                                                sitterId={sitter.userId}
                                                initialIsFavorited={true}
                                                onToggle={(newStatus) => !newStatus && handleRemove(sitter.userId)}
                                            />
                                        </div>

                                        <div className="hero-location">{sitter.state}</div>

                                        <div className="hero-stats">
                                            <div className="stat-item">⭐ {sitter.petSitter.averageRating.toFixed(1)}</div>
                                            <div className="stat-item">🐾 {sitter.petSitter.petTypes.join(", ")}</div>
                                        </div>

                                        <p className="hero-description">
                                            {sitter.petSitter.aboutText || "No description provided."}
                                        </p>

                                        <div className="hero-actions">
                                            <Link to={`/sitter/${sitter.userId}`} className="view-profile-btn">
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
