import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../services/api";
import { getAuth } from "../auth/authStore";
import ImageGallery from "../components/ImageGallery";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { translateState, type AustriaState } from "../lib/stateTranslations";
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
    state: AustriaState;
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
    isFavorited: boolean;
};

const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
};

type Booking = {
    bookingId: number;
    sitter: { user: { userId: number } };
    status: string;
};

export default function SitterProfile() {
    const { id } = useParams();
    const auth = getAuth();

    const [sitter, setSitter] = useState<SitterProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

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

    // Check for active bookings when sitter is loaded and user is an owner
    useEffect(() => {
        if (!sitter || !auth || auth.role !== "OWNER") return;

        api.get("/api/bookings/my")
            .then((res) => {
                const bookings: Booking[] = res.data;
                // Find active booking (PENDING or ACCEPTED) with this sitter
                const booking = bookings.find(
                    (b) =>
                        b.sitter.user.userId === sitter.userId &&
                        (b.status === "PENDING" || b.status === "ACCEPTED")
                );
                setActiveBooking(booking || null);
            })
            .catch((err) => {
                console.error("Failed to fetch bookings:", err);
            });
    }, [sitter, auth]);

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
            
            // Refresh bookings to update button state
            const res = await api.get("/api/bookings/my");
            const bookings: Booking[] = res.data;
            const booking = bookings.find(
                (b) =>
                    b.sitter.user.userId === sitter.userId &&
                    (b.status === "PENDING" || b.status === "ACCEPTED")
            );
            setActiveBooking(booking || null);
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
                                <span className="stat-label">{translateState(sitter.state)}</span>
                            </div>
                            {petTypes.length > 0 && (
                                <div className="stat-item pet-types-container">
                                    <div className="pet-types-tags">
                                        {petTypes.map((type, idx) => (
                                            <span key={idx} className="pet-type-tag">{type}</span>
                                        ))}
                                    </div>
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
                                disabled={sendingRequest || !!activeBooking}
                            >
                                {sendingRequest 
                                    ? "Sending..." 
                                    : activeBooking 
                                        ? "Booking requested" 
                                        : "Request Booking"}
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
                                        <span className="review-author">{review.ownerName}</span>
                                        <span className="review-stars">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    {review.text && <p className="review-text">"{review.text}"</p>}
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
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
