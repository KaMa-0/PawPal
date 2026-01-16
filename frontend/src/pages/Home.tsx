import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./home.css";

// Type tanımları
type AustriaState =
  | "WIEN" | "NIEDEROESTERREICH" | "OBEROESTERREICH" | "SALZBURG"
  | "TIROL" | "VORARLBERG" | "KAERNTEN" | "STEIERMARK" | "BURGENLAND";

type Review = {
  reviewId: number;
  rating: number;
  text?: string;
  createdAt: string;
};

type UserProfile = {
  userId: number;
  username: string;
  email: string;
  state: AustriaState;
  userType: string;
  petOwner?: { aboutText?: string };
  petSitter?: {
    aboutText?: string;
    bookings?: {
      review?: Review;
      owner: { user: { username: string } };
    }[]
  };
  profileImages: { imageId: number; imageUrl: string }[];
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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aboutText, setAboutText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    api.get(`/api/users/me`)
      .then(res => {
        const data = res.data;
        setProfile({
          ...data,
          aboutText: (data.petOwner?.aboutText) || (data.petSitter?.aboutText) || "",
          profileImages: data.profileImages || [],
        });
        setAboutText((data.petOwner?.aboutText) || (data.petSitter?.aboutText) || "");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        await api.post("/api/users/me/upload-profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await api.put("/api/users/me/about", { aboutText });

      // Refresh Data
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

  const reviews = profile?.userType === "SITTER" && profile.petSitter?.bookings
    ? profile.petSitter.bookings
      .filter(b => b.review)
      .map(b => ({ ...b.review!, ownerName: b.owner.user.username }))
    : [];

  // Greeting Logic based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="home-page-wrapper">
      <Navbar />

      <div className="home-content-area">
        <div className="dashboard-container">

          {/* --- HERO SECTION --- */}
          <div className="dashboard-hero">
            <div className="hero-text">
              <h1 className="hero-greeting">{greeting}, {profile?.username}!</h1>
              <p className="hero-subtitle">
                {profile?.userType === "OWNER"
                  ? "Ready to find the perfect companion for your pet?"
                  : "Ready to connect with pet owners and grow your business?"}
              </p>

              <div className="hero-stats">
                {/* Quick Stats / Actions */}

                {profile?.userType === "OWNER" ? (
                  <Link to="/search" className="stat-card highlight">
                    <span className="stat-value">🔍</span>
                    <span className="stat-label">Find Sitter</span>
                  </Link>
                ) : (
                  <div className="stat-card highlight">
                    <span className="stat-value">⭐</span>
                    <span className="stat-label">{reviews.length} Reviews</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- MAIN GRID --- */}
          <div className="dashboard-grid">

            {/* Left Column: Profile Settings */}
            <div className="dashboard-card profile-editor-card">
              <div className="card-header">
                <h2>Profile Settings</h2>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="profile-edit-layout">
                {/* Image Upload */}
                <div className="profile-upload-section">
                  <div className="profile-image-wrapper">
                    {previewUrl ? (
                      <img src={previewUrl?.startsWith("blob:") ? previewUrl : resolveImageUrl(previewUrl)} alt="Profile" className="profile-image" />
                    ) : (
                      <div className="profile-placeholder">{profile?.username?.charAt(0).toUpperCase()}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="edit-icon-btn"
                      title="Change Photo"
                    >
                      ✏️
                    </button>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="file-input-hidden" />
                </div>

                {/* Text Fields */}
                <div className="profile-fields-section">
                  <div className="field-group">
                    <label className="field-label">About Me</label>
                    <textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      placeholder="Tell others about yourself..."
                      className="profile-textarea"
                    />
                  </div>

                  <div className="action-buttons">
                    <button onClick={handleSave} className="save-btn" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>

                    {/* Sitter Certification Button */}
                    {auth?.role === "SITTER" && (
                      <button onClick={() => navigate("/submit-certification")} className="secondary-btn">
                        Manage Certification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account Actions & Reviews */}
            <div className="dashboard-sidebar">

              {/* Account Security */}
              <div className="dashboard-card">
                <h3>Account Security</h3>
                <div className="sidebar-links">
                  <button onClick={() => navigate("/change-password")} className="sidebar-link">
                    Change Password
                  </button>
                </div>
              </div>

              {/* Reviews (Only for Sitters) */}
              {auth?.role === "SITTER" && (
                <div className="dashboard-card reviews-card">
                  <h3>Latest Reviews</h3>
                  {reviews.length === 0 ? (
                    <p className="empty-state-text">No reviews yet.</p>
                  ) : (
                    <div className="mini-reviews-list">
                      {reviews.slice(0, 3).map((review, idx) => (
                        <div key={idx} className="mini-review-item">
                          <div className="mini-review-header">
                            <span className="author">{review.ownerName}</span>
                            <span className="stars">{"★".repeat(review.rating)}</span>
                          </div>
                          <p className="mini-review-text">"{review.text}"</p>
                        </div>
                      ))}
                      {reviews.length > 3 && <p className="see-more">...and {reviews.length - 3} more</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}