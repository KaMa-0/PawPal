import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./favorites.css";

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchFavorites = () => {
        setLoading(true);
        api.get("/api/users/favorites")
            .then(res => setFavorites(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const removeFavorite = async (e: React.MouseEvent, sitterId: number) => {
        e.preventDefault();
        try {
            await api.post(`/api/users/favorites/${sitterId}`, { action: 'remove' });
            setFavorites(prev => prev.filter(fav => fav.userId !== sitterId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="favorites-wrapper">
            <div className="favorites-header">
                <h1 className="favorites-title">My Favorite Sitters</h1>
                <button
                    className="back-button"
                    onClick={() => navigate("/search")}
                >
                    ← Back to Search
                </button>
            </div>

            <div className="favorites-container">
                {loading ? (
                    <p className="loading-text">Loading...</p>
                ) : favorites.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't favorited anyone yet.</p>
                    </div>
                ) : (
                    <div className="results-grid">
                        {favorites.map(fav => (
                            <Link to={`/sitters/${fav.userId}`} key={fav.userId} className="sitter-card-link">
                                <div className="sitter-card">
                                    <button
                                        onClick={(e) => removeFavorite(e, fav.userId)}
                                        className="favorite-button"
                                        title="Remove from favorites"
                                    >
                                        ❤️
                                    </button>
                                    <div className="sitter-name">{fav.username}</div>
                                    <div className="sitter-location">{fav.state}</div>
                                    <div className="sitter-meta">⭐ {fav.petSitter.averageRating.toFixed(1)}</div>
                                    <p className="sitter-text">{fav.petSitter.aboutText || "No information"}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}