import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuth } from "../auth/authStore";
import "./sitterProfile.css";

export default function SitterProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    const [sitter, setSitter] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resProfile = await api.get(`/api/users/sitters/${id}`);
                setSitter(resProfile.data);

                if (auth?.role === "OWNER") {
                    const resFavs = await api.get("/api/users/favorites/ids");
                    if (resFavs.data.includes(Number(id))) setIsFavorite(true);
                }
            } catch (err) {
                console.error(err);
                setError("Sitter not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, auth?.role, auth?.userId]);

    const toggleFav = async () => {
        if (!auth || auth.role !== "OWNER") return;
        try {
            const action = isFavorite ? "remove" : "add";
            setIsFavorite(!isFavorite);
            await api.post(`/api/users/favorites/${id}`, { action });
        } catch (err) {
            console.error(err);
            setIsFavorite(!isFavorite);
        }
    };

    const handleRequestBooking = async () => {
        try {
            await api.post("/api/bookings/request", {
                sitterId: Number(id),
                details: "Requested via Profile Page",
            });
            alert("Booking request sent!");
        } catch (err) {
            alert("Error sending request");
        }
    };

    if (loading) return <div className="profile-container">Loading...</div>;
    if (error || !sitter) return <div className="profile-container">{error}</div>;

    const reviews = sitter.petSitter?.bookings?.map((b: any) => b.review).filter(Boolean) || [];

    const calculateLiveRating = () => {
        if (reviews.length === 0) return "New";
        const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const displayRating = calculateLiveRating();

    return (
        <div className="profile-container">
            <button onClick={() => navigate(-1)} className="back-button">
                ← Back
            </button>

            <div className="profile-header">
                <div className="profile-pic-large">
                    {sitter.profileImages?.[0]?.imageUrl ? (
                        <img src={sitter.profileImages[0].imageUrl} alt={sitter.username} />
                    ) : (
                        <div className="placeholder-pic">{sitter.username.charAt(0)}</div>
                    )}
                </div>

                <div className="profile-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h1>{sitter.username}</h1>
                        {auth?.role === "OWNER" && (
                            <button onClick={toggleFav} className="heart-btn-large">
                                {isFavorite ? "❤️" : "🤍"}
                            </button>
                        )}
                    </div>
                    <p className="location-badge">📍 {sitter.state}</p>
                    <p>
                        <strong>Pets:</strong> {sitter.petSitter?.petTypes?.join(", ")}
                    </p>
                    <p>
                        <strong>Rating:</strong> ⭐ {displayRating}
                    </p>
                </div>
            </div>

            <div className="profile-section">
                <h2>About Me</h2>
                <p>{sitter.petSitter?.aboutText || "No description provided."}</p>
            </div>

            {auth?.role === "OWNER" && (
                <button onClick={handleRequestBooking} className="booking-btn-large">
                    Request Booking
                </button>
            )}

            <div className="profile-section">
                <h2>Reviews ({reviews.length})</h2>
                {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    <div className="reviews-list">
                        {sitter.petSitter.bookings.map((booking: any) => (
                            <div key={booking.bookingId} className="review-item">
                                <div className="review-header">
                                    <strong>{booking.owner.user.username}</strong>
                                    <span>⭐ {booking.review.rating}</span>
                                </div>
                                <p>{booking.review.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}