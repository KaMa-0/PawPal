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
        petTypes?: string[];
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

    if (loading) return (
        <div className="sitter-profile-page">
            <Navbar />
            <div className="profile-loading">Loading Profile...</div>
            <Footer />
        </div>
    );
    if (error) return (
        <div className="sitter-profile-page">
            <Navbar />
            <div className="profile-error-container">
                <p>{error}</p>
            </div>
            <Footer />
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
    const petTypes = sitter.petSitter.petTypes || [];

    const avatarImage = sitter.profileImages.find(img => img.isAvatar);
    const profileImageUrl = avatarImage
        ? resolveImageUrl(avatarImage.imageUrl)
        : (sitter.profileImages.length > 0 ? resolveImageUrl(sitter.profileImages[0].imageUrl) : null);

    const galleryImages = avatarImage
        ? sitter.profileImages.filter(img => img.imageId !== avatarImage.imageId)
        : sitter.profileImages.slice(1);

    return (
        <div className="sitter-profile-page">
            <Navbar />
            <div className="sitter-profile-container">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-avatar-wrapper">
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt={sitter.username} className="profile-avatar" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {sitter.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="profile-header-info">
                        <div className="profile-name-row">
                            <h1 className="profile-name">{sitter.username}</h1>
                            {isCertified && (
                                <span className="certified-badge">
                                    <svg className="certified-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Certified
                                </span>
                            )}
                        </div>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <svg className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="stat-label">{sitter.state}</span>
                            </div>
                            {petTypes.length > 0 && (
                                <div className="stat-item">
                                    <svg className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                                    </svg>
                                    <span className="stat-label">{petTypes.join(", ")}</span>
                                </div>
                            )}
                            <div className="stat-item">
                                <svg className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="stat-label">
                                    {averageRating} <span className="stat-subtext">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                                </span>
                            </div>
                        </div>

                        {auth?.role === "OWNER" && (
                            <button
                                onClick={handleRequestBooking}
                                className="booking-button"
                                disabled={sendingRequest}
                            >
                                {sendingRequest ? "Sending..." : "Request Booking"}
                            </button>
                        )}
                    </div>
                </div>

                {/* About Section */}
                <div className="profile-section">
                    <h2 className="section-title">About Me</h2>
                    <div className="about-content">
                        <p className="about-text">
                            {sitter.petSitter.aboutText || "This sitter hasn't written a description yet."}
                        </p>
                    </div>
                </div>

                {/* Gallery Section */}
                {galleryImages.length > 0 && (
                    <div className="profile-section">
                        <h2 className="section-title">Photos</h2>
                        <div className="gallery-wrapper">
                            <ImageGallery images={galleryImages} readonly />
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="profile-section">
                    <h2 className="section-title">Reviews <span className="review-count">({totalReviews})</span></h2>
                    {reviews.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-reviews-text">No reviews yet.</p>
                        </div>
                    ) : (
                        <div className="reviews-grid">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="review-card">
                                    <div className="review-header">
                                        <div className="review-author">
                                            <div className="review-author-avatar">
                                                {review.ownerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="review-author-info">
                                                <span className="review-author-name">{review.ownerName}</span>
                                                <div className="review-rating">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`star-icon ${i < review.rating ? 'star-filled' : 'star-empty'}`}
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                    <span className="review-date">
                                                        {(() => {
                                                            const now = new Date();
                                                            const reviewDate = new Date(review.createdAt);
                                                            const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                            
                                                            if (diffDays === 0) return 'today';
                                                            if (diffDays === 1) return '1 day ago';
                                                            if (diffDays < 7) return `${diffDays} days ago`;
                                                            if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`;
                                                            if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'month' : 'months'} ago`;
                                                            return `${Math.floor(diffDays / 365)} ${Math.floor(diffDays / 365) === 1 ? 'year' : 'years'} ago`;
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {review.text && (
                                        <p className="review-content">{review.text}</p>
                                    )}
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