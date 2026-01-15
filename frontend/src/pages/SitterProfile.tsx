import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../services/api";
import { getAuth } from "../auth/authStore";
import "./home.css"; // Reuse general styles if needed
import "./SitterProfile.css";
import ImageGallery from "../components/ImageGallery";
import FavoriteButton from "../components/FavoriteButton";

type Review = {
    reviewId: number;
    rating: number;
    text?: string;
    createdAt: string;
};

type SitterProfileData = {
    userId: number;
    username: string;
    state: string;
    profileImages: { imageId: number; imageUrl: string; isAvatar: boolean }[];
    petSitter: {
        aboutText?: string;
        certificationRequests: { status: string }[];
        bookings: {
            review?: Review;
            owner: { user: { username: string } };
        }[];
    };
    isFavorited: boolean;
};

const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
};

export default function SitterProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    const [sitter, setSitter] = useState<SitterProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/api/users/sitter/${id}`)
            .then((res) => setSitter(res.data))
            .catch((err) => {
                console.error(err);
                setError("Failed to load sitter profile. They may not exist.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleRequestBooking = async () => {
        if (!auth || auth.role !== "OWNER") {
            alert("Only Pet Owners can request bookings.");
            return;
        }
        if (!sitter) return;

        setSendingRequest(true);
        try {
            await api.post("/api/bookings/request", {
                sitterId: sitter.userId,
                details: "Booking requested via profile page"
            });
            alert("Booking request sent successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to send booking request.");
        } finally {
            setSendingRequest(false);
        }
    };

    const handleBack = () => {
        navigate(-1); // Go back to search
    };

    if (loading) return <div className="loading-container">Loading Profile...</div>;
    if (error) return (
        <div className="error-container">
            <p>{error}</p>
            <button onClick={handleBack} className="back-button">Go Back</button>
        </div>
    );
    if (!sitter) return null;

    // Calculate stats
    const reviews = sitter.petSitter.bookings
        .filter(b => b.review)
        .map(b => ({ ...b.review!, ownerName: b.owner.user.username }));

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "N/A";

    const isCertified = sitter.petSitter.certificationRequests.some(r => r.status === "APPROVED");

    const avatarImage = sitter.profileImages.find(img => img.isAvatar);
    const profileImageUrl = avatarImage
        ? resolveImageUrl(avatarImage.imageUrl)
        : (sitter.profileImages.length > 0 ? resolveImageUrl(sitter.profileImages[0].imageUrl) : null);

    const galleryImages = sitter.profileImages.filter(img => img.imageUrl !== avatarImage?.imageUrl);

    return (
        <div className="sitter-profile-container">
            <div className="sitter-profile-card">

                {/* Header */}
                <div className="profile-header">
                    {profileImageUrl ? (
                        <img src={profileImageUrl} alt={sitter.username} className="profile-avatar-large" />
                    ) : (
                        <div className="profile-avatar-placeholder-large">No Image</div>
                    )}

                    <div className="profile-info">
                        <h1 className="profile-name">
                            {sitter.username}
                            {isCertified && <span className="certification-badge">✓ Certified</span>}
                            {auth?.role === "OWNER" && (
                                <FavoriteButton
                                    className="profile-favorite-btn"
                                    sitterId={sitter.userId}
                                    initialIsFavorited={sitter.isFavorited}
                                    onToggle={() => {
                                        // Update local state if needed, though button handles itself visuals.
                                        // Ideally we update the sitter object to keep consistency if we navigate away and back?
                                        // but for now local visual feedback is enough.
                                    }}
                                />
                            )}
                        </h1>
                        <div className="profile-location">
                            📍 {sitter.state}
                        </div>
                        <div className="profile-meta">
                            ⭐ {averageRating} ({totalReviews} Reviews)
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button onClick={handleBack} className="back-button">Back</button>
                        {auth?.role === "OWNER" && (
                            <button
                                onClick={handleRequestBooking}
                                className="request-button"
                                disabled={sendingRequest}
                            >
                                {sendingRequest ? "Sending..." : "Request Booking"}
                            </button>
                        )}
                    </div>
                </div>

                {/* About Section */}
                <div className="profile-about">
                    <h2 className="section-title">About Me</h2>
                    <p className="about-text">
                        {sitter.petSitter.aboutText || "This sitter hasn't written a description yet."}
                    </p>

                    {/* Public Gallery */}
                    {galleryImages.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#555' }}>Photos</h3>
                            <ImageGallery images={galleryImages} readonly />
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="profile-reviews">
                    <h2 className="section-title">Reviews ({totalReviews})</h2>
                    {reviews.length === 0 ? (
                        <p className="no-reviews">No reviews yet.</p>
                    ) : (
                        <div className="reviews-grid">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="review-card">
                                    <div className="review-card-header">
                                        <div>
                                            <span style={{ marginRight: '10px' }}>{review.ownerName}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 'normal' }}>
                                                {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="review-card-rating">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    {review.text && <p className="review-card-text">"{review.text}"</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
