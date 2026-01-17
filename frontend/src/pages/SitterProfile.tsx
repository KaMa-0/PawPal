import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../services/api";
import { getAuth } from "../auth/authStore";
import ImageGallery from "../components/ImageGallery";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./SitterProfile.css";

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
        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.response?.data?.message || "Failed to send booking request.";
            alert(errorMessage);
        } finally {
            setSendingRequest(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <div className="profile-loading">Loading Profile...</div>;
    if (error) return (
        <div className="profile-error-container">
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
        <div className="sitter-profile-page">
            <Navbar />
            <div className="sitter-profile-card">

                {/* Header Section */}
                <div className="profile-header-section">
                    <div className="profile-image-container">
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt={sitter.username} className="profile-avatar-large" />
                        ) : (
                            <div className="profile-avatar-placeholder-large">
                                {sitter.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="profile-info-content">
                        <h1 className="profile-username">
                            {sitter.username}
                            {isCertified && <span className="verified-badge">✓ Certified</span>}
                        </h1>
                        <div className="profile-meta-row">
                            <span className="meta-item">📍 {sitter.state}</span>
                            <span className="meta-item">⭐ {averageRating} ({totalReviews} Reviews)</span>
                        </div>
                    </div>

                    <div className="profile-actions-row">
                        <button onClick={handleBack} className="profile-btn secondary">Back</button>
                        {auth?.role === "OWNER" && (
                            <button
                                onClick={handleRequestBooking}
                                className="profile-btn primary"
                                disabled={sendingRequest}
                            >
                                {sendingRequest ? "Sending..." : "Request Booking"}
                            </button>
                        )}
                    </div>
                </div>

                {/* About Section */}
                <div className="profile-content-section">
                    <h2 className="section-header">About Me</h2>
                    <p className="about-text">
                        {sitter.petSitter.aboutText || "This sitter hasn't written a description yet."}
                    </p>

                    {/* Gallery Section */}
                    {galleryImages.length > 0 && (
                        <div className="gallery-section">
                            <h3 className="gallery-title">Photos</h3>
                            <ImageGallery images={galleryImages} readonly />
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="profile-content-section">
                    <h2 className="section-header">Reviews ({totalReviews})</h2>
                    {reviews.length === 0 ? (
                        <p className="empty-reviews">No reviews yet.</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="review-item">
                                    <div className="review-item-header">
                                        <div className="review-author-info">
                                            <span className="review-author-name">{review.ownerName}</span>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="review-stars">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    {review.text && <p className="review-text">"{review.text}"</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    );
}