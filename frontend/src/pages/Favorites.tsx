import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./search.css"; // Wir nutzen einfach die Styles der Suche wieder

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            // Liste filtern statt neu laden (schneller)
            setFavorites(prev => prev.filter(fav => fav.userId !== sitterId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="search-container">
            <h1 className="search-title">My Favorite Sitters</h1>
            <Link to="/search" style={{ display: 'block', marginBottom: '20px', textAlign: 'center' }}>← Back to Search</Link>

            {loading ? <p>Loading...</p> : favorites.length === 0 ? (
                <p className="empty-state">You haven't favorited anyone yet.</p>
            ) : (
                <div className="results-grid">
                    {favorites.map(fav => (
                        <Link to={`/sitters/${fav.userId}`} key={fav.userId} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="sitter-card" style={{ position: "relative" }}>
                                <div className="sitter-name">{fav.username}</div>
                                <div className="sitter-location">{fav.state}</div>
                                <div className="sitter-meta">⭐ {fav.petSitter.averageRating.toFixed(1)}</div>
                                <p className="sitter-text">{fav.petSitter.aboutText || "No info"}</p>

                                <button
                                    onClick={(e) => removeFavorite(e, fav.userId)}
                                    style={{
                                        position: "absolute", top: "10px", right: "10px",
                                        background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", zIndex: 10
                                    }}
                                    title="Remove from favorites"
                                >
                                    ❤️
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}