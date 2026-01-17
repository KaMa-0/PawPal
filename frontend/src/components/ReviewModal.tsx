import { useState } from "react";
import { Star, X } from "lucide-react";
import "./ReviewModal.css";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, text: string) => Promise<void>;
    loading: boolean;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, loading }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [text, setText] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }
        await onSubmit(rating, text);
        // Reset after submit
        setRating(0);
        setText("");
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-container">
                <button
                    onClick={onClose}
                    className="review-modal-close"
                >
                    <X size={20} />
                </button>

                <h2 className="review-modal-title">
                    Write a Review
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="review-star-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="review-star-button"
                            >
                                <Star
                                    size={36}
                                    fill={star <= (hoveredRating || rating) ? "#fbbf24" : "rgba(255, 255, 255, 0.1)"}
                                    color="#ffffff"
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="review-text-group">
                        <label className="review-text-label">
                            Share your experience (optional)
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Tell us about your experience..."
                            className="review-textarea"
                        />
                    </div>

                    <div className="review-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="review-btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="review-btn-submit"
                        >
                            {loading ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
