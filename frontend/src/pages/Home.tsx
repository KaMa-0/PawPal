import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { clearAuth } from "../auth/authStore";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import "./home.css";

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
  // ... existing hooks ...
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

  // Fetch user profile on mount
  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    api.get(`/api/users/me`)
      .then(res => {
        const data = res.data;
        setProfile({
          ...data,
          // userType handles which relation is populated, but types need care
          // aboutText extraction logic stays same
          aboutText: (data.petOwner?.aboutText) || (data.petSitter?.aboutText) || "",
          profileImages: data.profileImages || [],
        });
        setAboutText((data.petOwner?.aboutText) || (data.petSitter?.aboutText) || "");
        if (data.profileImages?.length > 0) {
          setPreviewUrl(resolveImageUrl(data.profileImages[0].imageUrl)); // show first image
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, [auth]);

  // ... handleImageChange and handleSave stay the same ...
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

  // Extract reviews if sitter
  const reviews = profile?.userType === "SITTER" && profile.petSitter?.bookings
    ? profile.petSitter.bookings
      .filter(b => b.review)
      .map(b => ({ ...b.review!, ownerName: b.owner.user.username }))
    : [];

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

      <button onClick={handleSave} className="profile-save-button">
        Save Profile
      </button>

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

      <button onClick={handleLogout} className="logout-button" style={{ marginTop: '2rem' }}>
        Logout
      </button>
    </div>
  );
}


