import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./home.css";

// Type definitions
type AustriaState =
  | "WIEN" | "NIEDEROESTERREICH" | "OBEROESTERREICH" | "SALZBURG"
  | "TIROL" | "VORARLBERG" | "KAERNTEN" | "STEIERMARK" | "BURGENLAND";

type Review = {
  reviewId: number;
  rating: number;
  text?: string;
  createdAt: string;
  ownerName?: string;
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
  profileImages: { imageId: number; imageUrl: string; isAvatar: boolean }[];
};

const resolveImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

export default function Home() {
  const [auth] = useState(() => getAuth());
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // About Me State
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [isSavingAbout, setIsSavingAbout] = useState(false);

  const getInitialAboutText = () => {
    if (!profile) return "";
    return profile.userType === "SITTER"
      ? profile.petSitter?.aboutText || ""
      : profile.petOwner?.aboutText || "";
  };

  const fetchProfile = () => {
    if (!auth) return;
    setLoading(true);
    api.get(`/api/users/me`)
      .then(res => {
        setProfile(res.data);
        // Initialize about text
        const text = res.data.userType === "SITTER"
          ? res.data.petSitter?.aboutText || ""
          : res.data.petOwner?.aboutText || "";
        setAboutText(text);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [auth]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !auth) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);
      formData.append("isAvatar", "true");
      await api.post("/api/users/me/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError("Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !auth) return;

    setUploadingGallery(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);
      formData.append("isAvatar", "false");
      await api.post("/api/users/me/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError("Failed to upload image.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await api.delete(`/api/users/me/profile-images/${imageId}`);
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError("Failed to delete image.");
    }
  };

  const handleSaveAbout = async () => {
    if (!auth) return;
    setIsSavingAbout(true);
    setError(null);

    try {
      await api.put("/api/users/me/about", { aboutText });
      setIsEditingAbout(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError("Failed to update about me.");
      setIsSavingAbout(false);
    } finally {
      setIsSavingAbout(false);
    }
  };

  const reviews = profile?.userType === "SITTER" && profile.petSitter?.bookings
    ? profile.petSitter.bookings
      .filter(b => b.review)
      .map(b => ({ ...b.review!, ownerName: b.owner.user.username }))
    : [];

  const avatarImage = profile?.profileImages.find(img => img.isAvatar);
  const avatarUrl = avatarImage
    ? resolveImageUrl(avatarImage.imageUrl)
    : null;

  const galleryImages = profile?.profileImages.filter(img => !img.isAvatar) || [];

  const isAdmin = auth?.role === "ADMIN";
  const isSitter = auth?.role === "SITTER";

  if (loading && !profile) {
    return (
      <div className="home-page-wrapper">
        <Navbar />
        <div className="home-content-area">
          <div className="loading-state">Loading profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home-page-wrapper">
      <Navbar />

      <div className="home-content-area">
        <div className="settings-container">

          <h1 className="page-title">Profile Settings</h1>

          {error && <div className="error-message">{error}</div>}

          {/* Avatar Section - Hidden for Admin */}
          {!isAdmin && (
            <div className="settings-card">
              <h2 className="card-title">Profile Avatar</h2>
              <div className="avatar-section">
                <div className="avatar-display">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="avatar-actions">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="btn-primary"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    ref={avatarInputRef}
                    className="file-input-hidden"
                  />
                  <p className="helper-text">Upload a new profile picture</p>
                </div>
              </div>
            </div>
          )}

          {/* About Me Section - Hidden for Admin */}
          {!isAdmin && (
            <div className="settings-card">
              <div className="card-header-row">
                <h2 className="card-title">About Me</h2>
                {!isEditingAbout && (
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="btn-edit-header"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingAbout ? (
                <div className="about-edit-form">
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="about-textarea"
                    rows={6}
                    placeholder="Tell others about yourself..."
                  />
                  <div className="form-actions">
                    <button
                      onClick={handleSaveAbout}
                      className="btn-primary"
                      disabled={isSavingAbout}
                    >
                      {isSavingAbout ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAbout(false);
                        setAboutText(getInitialAboutText());
                      }}
                      className="btn-secondary"
                      disabled={isSavingAbout}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="about-display">
                  {profile && getInitialAboutText() ? (
                    <p className="about-text">{getInitialAboutText()}</p>
                  ) : (
                    <p className="about-empty-state">
                      No information provided yet. Click the Edit button above to add something about yourself.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Pictures Gallery - Hidden for Admin */}
          {!isAdmin && (
            <div className="settings-card">
              <h2 className="card-title">Profile Pictures</h2>
              <p className="card-description">
                Add photos to showcase your profile. You can upload and delete images.
              </p>

              {/* Upload Button */}
              <div className="gallery-upload-section">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="btn-secondary"
                  disabled={uploadingGallery}
                >
                  {uploadingGallery ? "Uploading..." : "+ Add Photo"}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  ref={galleryInputRef}
                  className="file-input-hidden"
                />
              </div>

              {/* Gallery Grid */}
              {galleryImages.length === 0 ? (
                <p className="empty-state">No profile pictures yet. Add some above!</p>
              ) : (
                <div className="gallery-grid">
                  {galleryImages.map((img) => (
                    <div key={img.imageId} className="gallery-item">
                      <img
                        src={resolveImageUrl(img.imageUrl)}
                        alt="Profile"
                        className="gallery-image"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.imageId)}
                        className="delete-btn"
                        title="Delete image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Section - All Roles */}
          <div className="settings-card">
            <h2 className="card-title">Account Security</h2>
            <div className="action-list">
              <button
                onClick={() => navigate("/change-password")}
                className="action-item"
              >
                <span className="action-icon">🔒</span>
                <div className="action-content">
                  <span className="action-label">Change Password</span>
                  <span className="action-description">Update your account password</span>
                </div>
                <span className="action-arrow">›</span>
              </button>

              {/* Admin: Certification Dashboard */}
              {isAdmin && (
                <button
                  onClick={() => navigate("/certifications")}
                  className="action-item"
                >
                  <span className="action-icon">📋</span>
                  <div className="action-content">
                    <span className="action-label">Certification Dashboard</span>
                    <span className="action-description">Review sitter certifications</span>
                  </div>
                  <span className="action-arrow">›</span>
                </button>
              )}
            </div>
          </div>

          {/* Certification Section - Sitters Only */}
          {isSitter && (
            <div className="settings-card">
              <h2 className="card-title">Certification</h2>
              <div className="action-list">
                <button
                  onClick={() => navigate("/submit-certification")}
                  className="action-item"
                >
                  <span className="action-icon">✓</span>
                  <div className="action-content">
                    <span className="action-label">Submit Certification Request</span>
                    <span className="action-description">Get certified to boost your profile</span>
                  </div>
                  <span className="action-arrow">›</span>
                </button>
              </div>
            </div>
          )}

          {/* Reviews Section - Sitters Only */}
          {isSitter && (
            <div className="settings-card">
              <h2 className="card-title">Your Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="empty-state">No reviews yet.</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="review-item">
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
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
