import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { clearAuth } from "../auth/authStore";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import "./home.css";
import ImageGallery from "../components/ImageGallery";

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

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aboutText, setAboutText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile on mount
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
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, [auth]);

  const handleUpload = async (file: File, isAvatar: boolean) => {
    if (!auth) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("isAvatar", String(isAvatar));

      await api.post("/api/users/me/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh profile
      const res = await api.get(`/api/users/me`);
      setProfile({
        ...res.data,
        aboutText: res.data.petOwner?.aboutText || res.data.petSitter?.aboutText || "",
        profileImages: res.data.profileImages || [],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0], true);
      e.target.value = "";
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0], false);
      e.target.value = "";
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/users/me/profile-images/${imageId}`);
      const res = await api.get(`/api/users/me`);
      setProfile({
        ...res.data,
        aboutText: res.data.petOwner?.aboutText || res.data.petSitter?.aboutText || "",
        profileImages: res.data.profileImages || [],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete image.");
    }
  };

  const handleSaveAbout = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await api.put("/api/users/me/about", { aboutText });
      alert("About text updated!");
    } catch (err) {
      console.error(err);
      setError("Failed to save about text.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  // Extract reviews if sitter
  const reviews = profile?.userType === "SITTER" && profile.petSitter?.bookings
    ? profile.petSitter.bookings
      .filter(b => b.review)
      .map(b => ({ ...b.review!, ownerName: b.owner.user.username }))
    : [];

  const avatarImage = profile?.profileImages?.find(img => img.isAvatar);
  const galleryImages = profile?.profileImages?.filter(img => !img.isAvatar) || [];

  return (
    <div className="home-container">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button onClick={handleBack} className="logout-button">
          Back
        </button>
      </div>
      <h1 className="home-title">Welcome, {profile?.username}</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Profile Section for Owner and Sitter */}
      {auth?.role !== "ADMIN" && (
        <>
          {/* Avatar Section */}
          <div className="profile-section centered-section">
            <h2 className="section-subtitle">Avatar</h2>
            <div className="avatar-wrapper">
              {avatarImage ? (
                <img src={resolveImageUrl(avatarImage.imageUrl)} alt="Avatar" className="avatar-large" />
              ) : (
                <div className="avatar-placeholder-large">No Avatar</div>
              )}
              {avatarImage && (
                <button className="delete-avatar-btn" onClick={() => handleDelete(avatarImage.imageId)} title="Delete Avatar">×</button>
              )}
            </div>

            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            <button className="profile-save-button" onClick={() => avatarInputRef.current?.click()}>
              {avatarImage ? "Change Avatar" : "Upload Avatar"}
            </button>
          </div>

          {/* Profile Pictures Section */}
          <div className="profile-section">
            <h3 className="section-subtitle">Profile Pictures</h3>

            <ImageGallery
              images={galleryImages}
              onImageUpdate={() => {
                // Refresh
                api.get(`/api/users/me`).then(res => {
                  setProfile({
                    ...res.data,
                    aboutText: res.data.petOwner?.aboutText || res.data.petSitter?.aboutText || "",
                    profileImages: res.data.profileImages || [],
                  });
                });
              }}
            />

            <div className="upload-section" style={{ marginTop: '15px' }}>
              <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} className="hidden" accept="image/*" />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="profile-save-button secondary"
                style={{ backgroundColor: '#607d8b' }}
              >
                + Add New Photo
              </button>
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">About Me</label>
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Tell others about yourself..."
              className="profile-textarea"
            />
            <button onClick={handleSaveAbout} className="profile-save-button" style={{ marginTop: '10px' }}>
              Save About Text
            </button>
          </div>
        </>
      )}

      {auth?.role === "SITTER" && (
        <>
          <button onClick={() => navigate("/submit-certification")} className="profile-save-button" style={{ marginTop: '1rem' }}>
            Request Certification
          </button>

          {/* Reviews Section for Sitter */}
          <div className="profile-section" style={{ marginTop: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
            <h2 style={{ color: '#f57c00', fontSize: '1.4rem' }}>My Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p style={{ color: '#777', fontStyle: 'italic' }}>You haven't received any reviews yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {reviews.map((review, idx) => (
                  <div key={idx} style={{ backgroundColor: '#fff8e1', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ffb74d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span>{review.ownerName}</span>
                        <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 'normal' }}>
                          {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span style={{ color: '#ffb74d' }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    </div>
                    {review.text && <p style={{ fontStyle: 'italic', color: '#333' }}>"{review.text}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <button onClick={() => navigate("/change-password")} className="profile-save-button" style={{ marginTop: '2rem', backgroundColor: '#607d8b' }}>
        Change Password
      </button>

      <button onClick={handleLogout} className="logout-button" style={{ marginTop: '1rem' }}>
        Logout
      </button>
    </div>
  );
}
