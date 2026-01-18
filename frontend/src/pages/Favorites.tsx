import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import api, { API_BASE_URL } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FavoriteButton from "../components/FavoriteButton";
import { getAuth } from "../auth/authStore";
import { translateState, type AustriaState } from "../lib/stateTranslations";
import "./search.css"; // Reuse search card styles
import "./Favorites.css"; // Grid layout styles

// Define types locally if not shared, or import from common types
interface FavoriteSitter {
    userId: number;
    username: string;
    state: AustriaState;
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
                        <Link to="/search" className="search-button-primary">
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
                                    {/* Hero Image Section */}
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
                                            <div className="card-badge">
                                                <BadgeCheck size={14} strokeWidth={3} /> Certified
                                            </div>
                                        )}

                                        {/* Favorite Button */}
                                        <FavoriteButton
                                            sitterId={sitter.userId}
                                            initialIsFavorited={true}
                                            variant="card"
                                            onToggle={(newStatus) => !newStatus && handleRemove(sitter.userId)}
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="hero-content">
                                        <Link to={`/sitter/${sitter.userId}`} className="hero-name">
                                            {sitter.username}
                                        </Link>
                                        <div className="hero-meta">
                                            <div className="hero-location">
                                                <MapPin size={14} /> {translateState(sitter.state)}
                                            </div>
                                            <div className="hero-rating" title="Rating">
                                                <Star size={16} fill="#FBBF24" stroke="none" />
                                                <span>{sitter.petSitter.averageRating.toFixed(1)}</span>
                                            </div>
                                        </div>

                                        <div className="pet-tags-container">
                                            {sitter.petSitter.petTypes.map((type) => (
                                                <span key={type} className="pet-tag">
                                                    {type}
                                                </span>
                                            ))}
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
            <Footer />
        </div>
    );
}
