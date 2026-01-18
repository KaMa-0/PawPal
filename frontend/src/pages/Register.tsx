import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import api from "../services/api";
import { setAuth } from "../auth/authStore";
import type { Role } from "../auth/authStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./register.css";

// Type definition for the API response
type AuthResponse = {
    token: string;
    user: { id: number; email: string; role: Role };
};

export default function Register() {
    const nav = useNavigate();

    // Form state including the required 'petTypes' array
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        state: "",
        userType: "OWNER" as Role,
        petTypes: [] as string[],
    });

    const petOptions = ["DOG", "CAT", "BIRD", "RABBIT", "FISH", "REPTILE"];

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (formData.userType === "SITTER" && formData.petTypes.length === 0) {
            setError("Please select at least one pet type.");
            return;
        }

        try {
            const res = await api.post<AuthResponse>("/api/auth/register", formData);

            setAuth({
                token: res.data.token,
                userId: String(res.data.user.id),
                email: res.data.user.email,
                role: res.data.user.role,
            });

            nav("/");
        } catch (err: any) {
            console.error("Registration Error:", err);
            setError(err?.response?.data?.message || "Registration failed. Please try again.");
        }
    }

    return (
        <div className="register-container">
            <Navbar />
            <div className="register-content">
                <div className="register-card">

                    <h1 className="register-title">Sign Up</h1>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={onSubmit} className="register-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location (State)</label>
                            <div className="select-wrapper">
                                <select name="state" value={formData.state} onChange={handleChange} required className="form-select">
                                    <option value="" disabled>Select your state...</option>
                                    <option value="WIEN">Vienna (Wien)</option>
                                    <option value="NIEDEROESTERREICH">Lower Austria (Niederösterreich)</option>
                                    <option value="OBEROESTERREICH">Upper Austria (Oberösterreich)</option>
                                    <option value="SALZBURG">Salzburg</option>
                                    <option value="TIROL">Tyrol (Tirol)</option>
                                    <option value="VORARLBERG">Vorarlberg</option>
                                    <option value="KAERNTEN">Carinthia (Kärnten)</option>
                                    <option value="STEIERMARK">Styria (Steiermark)</option>
                                    <option value="BURGENLAND">Burgenland</option>
                                </select>
                                <ChevronDown className="select-icon" size={20} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">I am a...</label>
                            <div className="select-wrapper">
                                <select name="userType" value={formData.userType} onChange={handleChange} className="form-select">
                                    <option value="OWNER">Pet Owner</option>
                                    <option value="SITTER">Pet Sitter</option>
                                </select>
                                <ChevronDown className="select-icon" size={20} />
                            </div>
                        </div>

                        {/* Sitter Specific Options */}
                        {formData.userType === "SITTER" && (
                            <div className="form-group">
                                <label className="form-label">Pet Types I can sit</label>
                                <div className="pet-types-grid">
                                    {petOptions.map((pet) => (
                                        <label key={pet} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={pet}
                                                checked={formData.petTypes.includes(pet)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, petTypes: [...formData.petTypes, pet] });
                                                    } else {
                                                        setFormData({ ...formData, petTypes: formData.petTypes.filter(p => p !== pet) });
                                                    }
                                                }}
                                            />
                                            {pet.charAt(0).toUpperCase() + pet.slice(1).toLowerCase()}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="register-button">Register</button>
                    </form>

                    <div className="login-link">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}