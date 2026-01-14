import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { clearAuth } from "../auth/authStore";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import "./home.css";

// --- TYPEN ---

type AustriaState =
    | "WIEN" | "NIEDEROESTERREICH" | "OBEROESTERREICH" | "SALZBURG"
    | "TIROL" | "VORARLBERG" | "KAERNTEN" | "STEIERMARK" | "BURGENLAND";

// 1. Definition für ein Review
type ReviewData = {
  rating: number;
  text: string | null;
  createdAt: string;
};

// 2. Definition für eine Buchung, die ein Review enthält
type BookingWithReview = {
  bookingId: number;
  review: ReviewData;
  owner: {
    user: {
      username: string;
    };
  };
};

// 3. Aktualisiertes UserProfile
type UserProfile = {
  userId: number;
  username: string;
  email: string;
  state: AustriaState;
  userType: string;
  aboutText?: string;
  profileImages: { imageId: number; imageUrl: string }[];
  // Hilfsstrukturen, die vom Backend kommen
  petOwner?: {
    aboutText?: string;
  };
  petSitter?: {
    aboutText?: string;
    bookings: BookingWithReview[]; // Hier sind die Reviews drin
  };
};

const resolveImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

export default function Home() {
  const [auth] = useState(() => getAuth());
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aboutText, setAboutText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- DURCHSCHNITTSBERECHNUNG ---
  // Berechnet den Durchschnitt live anhand der geladenen Bookings
  const calculateAverageRating = () => {
    const bookings = profile?.petSitter?.bookings;
    if (!bookings || bookings.length === 0) return "0.0";

    const total = bookings.reduce((sum, booking) => sum + booking.review.rating, 0);
    const avg = total / bookings.length;
    return avg.toFixed(1); // Gibt z.B. "4.3" zurück
  };

  const averageRating = calculateAverageRating();
  // ------------------------------

  // Profil laden
  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    api.get(`/api/users/me`)
        .then(res => {
          const data = res.data;
          setProfile({
            ...data,
            aboutText: data.petOwner?.aboutText || data.petSitter?.aboutText || "",
            profileImages: data.profileImages || [],
          });
          setAboutText(data.petOwner?.aboutText || data.petSitter?.aboutText || "");
          if (data.profileImages?.length > 0) {
            setPreviewUrl(resolveImageUrl(data.profileImages[0].imageUrl));
          }
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load profile.");
        })
        .finally(() => setLoading(false));
  }, [auth]);

  // Bild auswählen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Profil speichern
  const handleSave = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Bild hochladen falls ausgewählt
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        await api.post("/api/users/me/upload-profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 2. Text aktualisieren
      await api.put("/api/users/me/about", { aboutText });

      // 3. Profil neu laden
      const res = await api.get(`/api/users/me`);
      setProfile({
        ...res.data,
        aboutText: res.data.petOwner?.aboutText || res.data.petSitter?.aboutText || "",
        profileImages: res.data.profileImages || [],
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/search");
  };

  return (
      <div className="home-container">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <button onClick={handleBack} className="logout-button">
            Back
          </button>
        </div>
        <h1 className="home-title">Welcome, {profile?.username}</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-section">
          <label className="profile-label">Profile Picture</label>
          <div className="profile-image-wrapper">
            {previewUrl ? (
                <img
                    src={previewUrl?.startsWith("blob:") ? previewUrl : resolveImageUrl(previewUrl)}
                    alt="Profile"
                    className="profile-image"
                />
            ) : (
                <div className="profile-placeholder">No image</div>
            )}
          </div>

          <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
          />

          <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="profile-save-button"
          >
            Update Profile Photo
          </button>
        </div>

        <div className="profile-section">
          <label className="profile-label">About Me</label>
          <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Tell others about yourself..."
              className="profile-textarea"
          />
        </div>

        {/* --- REVIEW SECTION (Nur für Sitter sichtbar) --- */}
        {profile?.userType === "SITTER" && profile.petSitter?.bookings && profile.petSitter.bookings.length > 0 && (
            <div className="profile-section">
              <h2
                  className="profile-label"
                  style={{
                    fontSize: "1.2rem",
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between" // Schiebt Elemente auseinander (Links & Rechts)
                  }}
              >
                {/* Linke Seite: Titel */}
                <span>Reviews ({profile.petSitter.bookings.length})</span>

                {/* Rechte Seite: Bewertung (Nur Nummer + Oranger Stern) */}
                {Number(averageRating) > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span>{averageRating}</span>
                <span style={{ color: "#f5a623" }}>★</span>
              </span>
                )}
              </h2>

              <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {profile.petSitter.bookings.map((booking) => (
                    <div
                        key={booking.bookingId}
                        className="review-card"
                        style={{
                          border: "1px solid #eee",
                          padding: "15px",
                          borderRadius: "8px",
                          backgroundColor: "#f9f9f9"
                        }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontWeight: "bold" }}>
                    {booking.owner.user.username}
                  </span>
                        <span style={{ color: "#f5a623", fontWeight: "bold" }}>
                    {booking.review.rating} / 5 ★
                  </span>
                      </div>

                      <p style={{ margin: "5px 0", color: "#555" }}>
                        {booking.review.text || "No comment provided."}
                      </p>

                      <small style={{ color: "#999" }}>
                        {new Date(booking.review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                ))}
              </div>
            </div>
        )}
        {/* --- ENDE REVIEW SECTION --- */}

        <button onClick={handleSave} className="profile-save-button">
          Save Profile
        </button>

        {auth?.role === "SITTER" && (
          <button onClick={() => navigate("/submit-certification")} className="profile-save-button">
            Request Certification
          </button>
        )}
      
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      
      </div>
  );
}