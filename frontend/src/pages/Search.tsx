import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Star, BadgeCheck, MapPin } from "lucide-react";
import { getAuth } from "../auth/authStore";
import api, { API_BASE_URL } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { translateState, type AustriaState } from "../lib/stateTranslations";
import "./search.css";

type PetSitter = {
    userId: number;
    username: string;
    state: AustriaState;
    petSitter: {
        aboutText?: string;
        averageRating: number;
        petTypes: string[];
        certificationRequests: Array<{
            requestId: number;
            status: string;
        }>;
    };
    profileImages: { imageUrl: string; isAvatar: boolean }[];
    isFavorited: boolean;
};

type Booking = {
    bookingId: number;
    sitter: { user: { userId: number } };
    status: string;
};

const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
};

export default function Search() {
    const auth = getAuth();
    const location = useLocation();

    const [sitters, setSitters] = useState<PetSitter[]>([]);
    const [state, setState] = useState("");
    const [petType, setPetType] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sendingRequest, setSendingRequest] = useState<number | null>(null);
    const [activeBookings, setActiveBookings] = useState<Map<number, Booking>>(new Map());

    // Fetch active bookings when user is an owner
    useEffect(() => {
        if (!auth || auth.role !== "OWNER") return;

        api.get("/api/bookings/my")
            .then((res) => {
                const bookings: Booking[] = res.data;
                // Create a map of sitterId -> active booking (PENDING or ACCEPTED)
                const bookingsMap = new Map<number, Booking>();
                bookings.forEach((booking) => {
                    if (booking.status === "PENDING" || booking.status === "ACCEPTED") {
                        bookingsMap.set(booking.sitter.user.userId, booking);
                    }
                });
                setActiveBookings(bookingsMap);
            })
            .catch((err) => {
                console.error("Failed to fetch bookings:", err);
            });
    }, [auth]);

    // Initialize filters from URL query params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paramState = params.get("state");
        const paramPetType = params.get("petType");
        const paramMinRating = params.get("minRating");

        if (paramState) setState(paramState);
        if (paramPetType) setPetType(paramPetType);
        if (paramMinRating) setMinRating(Number(paramMinRating));

        fetchSitters({
            state: paramState || "",
            petType: paramPetType || "",
            minRating: paramMinRating ? Number(paramMinRating) : 0
        });

    }, [location.search]);

    // Combined fetch function that takes optional overrides
    async function fetchSitters(overrides?: { state: string; petType: string; minRating: number }) {
        setLoading(true);
        const params: any = {};

        const currentState = overrides ? overrides.state : state;
        const currentPetType = overrides ? overrides.petType : petType;
        const currentMinRating = overrides ? overrides.minRating : minRating;

        if (currentState) params.state = currentState;
        if (currentPetType) params.petType = currentPetType;
        if (currentMinRating > 0) params.minRating = currentMinRating;

        try {
            const res = await api.get("/api/users/sitters", { params });
            setSitters(res.data);
        } catch (err) {
            console.error("Failed to load sitters", err);
        } finally {
            setLoading(false);
        }
    }

    // Send booking request to sitter (Only for Owners)
    const handleRequestBooking = async (sitterId: number) => {
        if (!auth || auth.role !== "OWNER") {
            alert("Only Pet Owners can request bookings.");
            return;
        }

        setSendingRequest(sitterId);

        try {
            await api.post("/api/bookings/request", {
                sitterId,
                details: "Booking requested via search page"
            });
            alert("Booking request sent!");
            
            // Refresh bookings to update button state
            const res = await api.get("/api/bookings/my");
            const bookings: Booking[] = res.data;
            const bookingsMap = new Map<number, Booking>();
            bookings.forEach((booking) => {
                if (booking.status === "PENDING" || booking.status === "ACCEPTED") {
                    bookingsMap.set(booking.sitter.user.userId, booking);
                }
            });
            setActiveBookings(bookingsMap);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.response?.data?.message || "Failed to send booking request";
            alert(errorMessage);
        } finally {
            setSendingRequest(null);
        }
    };

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-container">
                <h1 className="search-title">Find a Pet Sitter</h1>

                {/* Filters Section */}
                <div className="search-card">
                    <form
                        className="search-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchSitters();
                        }}
                    >
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <div className="select-wrapper">
                                <select
                                    className="form-input"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                >
                                    <option value="">All Locations</option>
                                    {[
                                        { value: "WIEN", label: "Vienna" },
                                        { value: "NIEDEROESTERREICH", label: "Lower Austria" },
                                        { value: "OBEROESTERREICH", label: "Upper Austria" },
                                        { value: "SALZBURG", label: "Salzburg" },
                                        { value: "TIROL", label: "Tyrol" },
                                        { value: "VORARLBERG", label: "Vorarlberg" },
                                        { value: "KAERNTEN", label: "Carinthia" },
                                        { value: "STEIERMARK", label: "Styria" },
                                        { value: "BURGENLAND", label: "Burgenland" },
                                    ].map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="select-icon" size={20} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Pet Type</label>
                            <div className="select-wrapper">
                                <select
                                    className="form-input"
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
                                <ChevronDown className="select-icon" size={20} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Minimum Rating</label>
                            <div className="select-wrapper">
                                <select
                                    className="form-input"
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
                                <ChevronDown className="select-icon" size={20} />
                            </div>
                        </div>

                        <div className="form-group">
                            <button type="submit" className="search-button-primary">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <p className="empty-state">Loading pet sitters…</p>
                ) : sitters.length === 0 ? (
                    <p className="empty-state">No pet sitters found.</p>
                ) : (
                    <div className="results-grid">
                        {sitters.map((sitter) => {
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

                                            {/* Show Request Button only for Owners */}
                                            {auth?.role === "OWNER" && (
                                                <button
                                                    className="request-btn"
                                                    disabled={sendingRequest === sitter.userId || activeBookings.has(sitter.userId)}
                                                    onClick={() => handleRequestBooking(sitter.userId)}
                                                >
                                                    {sendingRequest === sitter.userId 
                                                        ? "Sending..." 
                                                        : activeBookings.has(sitter.userId)
                                                            ? "Booking requested"
                                                            : "Request Booking"}
                                                </button>
                                            )}
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
