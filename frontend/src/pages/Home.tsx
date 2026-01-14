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

type UserProfile = {
  userId: number;
  username: string;
  email: string;
  state: AustriaState;
  userType: string;
  aboutText?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null); // Add ref

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
          aboutText: data.petOwner?.aboutText || data.petSitter?.aboutText || "",
          profileImages: data.profileImages || [],
        });
        setAboutText(data.petOwner?.aboutText || data.petSitter?.aboutText || "");
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

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle profile save
  const handleSave = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Upload new image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        await api.post("/api/users/me/upload-profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 2. Update "about me" text
      await api.put("/api/users/me/about", { aboutText });

      // 3. Refresh profile
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
        {/* HIDDEN Input - functionality only */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef} // Connect the ref here
          className="hidden" // Tailwind class to hide it
        />

        {/* VISIBLE Button - Design and Text */}
        <button

          type="button" // Prevent form submission
          onClick={() => fileInputRef.current?.click()} // Trigger the hidden input
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

