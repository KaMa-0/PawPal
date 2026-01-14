import { useEffect, useState } from "react";
import { getAuth } from "../auth/authStore";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./bookings.css";

// Keep types simple for the presentation
type Booking = {
  bookingId: number;
  owner: { user: { userId: number; username: string } };
  sitter: { user: { userId: number; username: string } };
  status: string;
  details?: string;
  requestDate: string;
  review?: {
    rating: number;
    text?: string;
  };
};

export default function Bookings() {
  const auth = getAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();
  // State für Review-Eingaben
  const [reviewInput, setReviewInput] = useState<{ [key: number]: { rating: number, text: string } }>({});

  // Show warning if not logged in
  if (!auth) {
    return <p style={{ padding: "2rem" }}>Please login first.</p>;
  }

  // Function to fetch data from the database
  async function fetchBookings() {
    try {
      const res = await api.get("/api/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.log("Error loading bookings:", err);
    }
  }

  // Fetch data when the page loads
  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBack = () => {
    navigate("/search");
  };

  // --- ACTION FUNCTIONS ---

  async function acceptBooking(id: number) {
    try {
      await api.post("/api/bookings/respond", { bookingId: id, accept: true });
      // KEIN nerviger Alert mehr bei Erfolg
      fetchBookings(); // Liste aktualisieren reicht als Feedback
    } catch (err) {
      alert("Error accepting booking"); // Fehler zeigen wir weiterhin an
    }
  }

  async function declineBooking(id: number) {
    try {
      await api.post("/api/bookings/respond", { bookingId: id, accept: false });
      fetchBookings();
    } catch (err) {
      alert("Error declining booking");
    }
  }

  async function completeBooking(id: number) {
    try {
      await api.post("/api/bookings/complete", { bookingId: id });
      fetchBookings();
    } catch (err) {
      alert("Error completing booking");
    }
  }

  async function submitReview(bookingId: number) {
    // 1. Hole das Input-Objekt oder ein leeres Objekt, falls noch nichts getippt wurde
    const input = reviewInput[bookingId] || {};

    // 2. WICHTIG: Wenn 'rating' nicht existiert (weil Dropdown nicht angefasst),
    // setze den Standardwert auf 5 (passend zur UI-Anzeige).
    const finalRating = input.rating ? Number(input.rating) : 5;
    const finalText = input.text || "";

    try {
      await api.post("/api/bookings/review", {
        bookingId,
        rating: finalRating,
        text: finalText
      });
      // Erfolgs-Alert entfernt
      fetchBookings(); // Liste neu laden -> Review-Formular verschwindet automatisch
    } catch (err) {
      alert("Error submitting review");
    }
  }

  const handleReviewChange = (bookingId: number, field: string, value: string | number) => {
    setReviewInput(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value
      }
    }));
  };

  return (
      <div className="mybookings-container">
        <h1>My Bookings</h1>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <button onClick={handleBack} className="logout-button">
            Back
          </button>
        </div>

        {bookings.length === 0 ? (
            <p>No bookings found.</p>
        ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                  <div key={booking.bookingId} className="booking-card">

                    {/* Simple info section */}
                    <div className="booking-info">
                      <p><strong>ID:</strong> {booking.bookingId}</p>
                      <p><strong>Owner:</strong> {booking.owner.user.username}</p>
                      <p><strong>Sitter:</strong> {booking.sitter.user.username}</p>
                      <p><strong>Date:</strong> {new Date(booking.requestDate).toLocaleDateString()}</p>
                      <p><strong>Details:</strong> {booking.details}</p>
                      <p><strong>Status:</strong> {booking.status}</p>
                    </div>

                    {/* Sitter Buttons: Visible only if User is Sitter AND Status is PENDING */}
                    {auth.role === "SITTER" && booking.status === "PENDING" && (
                        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                          <button
                              onClick={() => acceptBooking(booking.bookingId)}
                              style={{ backgroundColor: "green", color: "white", padding: "5px 10px" }}
                          >
                            Accept
                          </button>
                          <button
                              onClick={() => declineBooking(booking.bookingId)}
                              style={{ backgroundColor: "red", color: "white", padding: "5px 10px" }}
                          >
                            Decline
                          </button>
                        </div>
                    )}

                    {/* Owner Button: Visible only if User is Owner AND Status is ACCEPTED */}
                    {auth.role === "OWNER" && booking.status === "ACCEPTED" && (
                        <div style={{ marginTop: "10px" }}>
                          <button
                              onClick={() => completeBooking(booking.bookingId)}
                              style={{ backgroundColor: "blue", color: "white", padding: "5px 10px", width: "100%" }}
                          >
                            Mark as Completed
                          </button>
                        </div>
                    )}

                    {/* Completion message */}
                    {booking.status === "COMPLETED" && (
                        <p style={{ color: "gray", marginTop: "10px" }}>Service Completed ✅</p>
                    )}

                    {/* --- REVIEW SECTION --- */}

                    {/* Fall 1: Bereits bewertet */}
                    {booking.review && (
                        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f9f9f9", border: "1px solid #ddd" }}>
                          <p><strong>Review:</strong> {booking.review.rating} / 5 ⭐</p>
                          <p><i>"{booking.review.text}"</i></p>
                        </div>
                    )}

                    {/* Fall 2: Noch nicht bewertet, User ist Owner, Status Completed */}
                    {!booking.review && auth.role === "OWNER" && booking.status === "COMPLETED" && (
                        <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                          <h4>Write a Review</h4>

                          <div style={{ marginBottom: "5px" }}>
                            <label>Rating: </label>
                            <select
                                // UI zeigt standardmäßig 5 an, wenn noch nichts im State ist
                                value={reviewInput[booking.bookingId]?.rating || 5}
                                onChange={(e) => handleReviewChange(booking.bookingId, 'rating', e.target.value)}
                                style={{ padding: "5px" }}
                            >
                              <option value="5">5 - Excellent</option>
                              <option value="4">4 - Good</option>
                              <option value="3">3 - Okay</option>
                              <option value="2">2 - Bad</option>
                              <option value="1">1 - Terrible</option>
                            </select>
                          </div>

                          <div style={{ marginBottom: "5px" }}>
                       <textarea
                           placeholder="Share your experience..."
                           value={reviewInput[booking.bookingId]?.text || ""}
                           onChange={(e) => handleReviewChange(booking.bookingId, 'text', e.target.value)}
                           style={{ width: "100%", padding: "5px", minHeight: "60px" }}
                       />
                          </div>

                          <button
                              onClick={() => submitReview(booking.bookingId)}
                              style={{ backgroundColor: "#ff9800", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" }}
                          >
                            Submit Review
                          </button>
                        </div>
                    )}

                  </div>
              ))}
            </div>
        )}
      </div>
  );
}