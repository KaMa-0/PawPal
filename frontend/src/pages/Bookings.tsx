import { useEffect, useState } from "react";
import { getAuth } from "../auth/authStore";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReviewModal from "../components/ReviewModal";
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
    reviewId: number;
    rating: number;
    text?: string;
  };
};

export default function Bookings() {
  const auth = getAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const navigate = useNavigate();

  // Show warning if not logged in
  if (!auth) {
    return (
      <div className="mybookings-container">
        <p className="empty-state">Please login first.</p>
        <button onClick={() => navigate("/login")} className="logout-button" style={{ marginTop: '1rem' }}>
          Go to Login
        </button>
      </div>
    );
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
  // I defined separate functions for each action to make it easier to explain

  async function acceptBooking(id: number) {
    try {
      await api.post("/api/bookings/respond", { bookingId: id, accept: true });
      alert("Booking Accepted!");
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert("Error accepting booking");
    }
  }

  async function declineBooking(id: number) {
    try {
      await api.post("/api/bookings/respond", { bookingId: id, accept: false });
      alert("Booking Declined");
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert("Error declining booking");
    }
  }

  async function completeBooking(id: number) {
    // Ask for confirmation
    const confirm = window.confirm("Is this job completed?");
    if (!confirm) return;

    try {
      await api.post("/api/bookings/complete", { bookingId: id });
      alert("Service marked as Completed!");
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert("Error completing booking");
    }
  }

  const openReviewModal = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsReviewOpen(true);
  };

  const submitReview = async (rating: number, text: string) => {
    if (!selectedBookingId) return;

    setReviewLoading(true);
    try {
      await api.post("/api/reviews", {
        bookingId: selectedBookingId,
        rating,
        text
      });
      alert("Review submitted successfully!");
      setIsReviewOpen(false);
      fetchBookings(); // Refresh to show the review status
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="mybookings-container">
      <h1>My Bookings</h1>
      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", maxWidth: "1000px", marginBottom: "1.5rem" }}>
        <button onClick={handleBack} className="logout-button">
          Back
        </button>
      </div>

      {bookings.length === 0 ? (
        <p className="empty-state">No bookings found.</p>
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
                <p><strong>Status:</strong> <span style={{ color: booking.status === 'ACCEPTED' ? 'var(--success-color)' : booking.status === 'PENDING' ? 'var(--accent-secondary)' : booking.status === 'DECLINED' ? 'var(--error-color)' : 'var(--text-secondary)' }}>{booking.status}</span></p>
                {booking.review && (
                  <p className="review-rating">
                    Rating: {booking.review.rating}/5 ⭐
                  </p>
                )}
              </div>

              {/* Sitter Buttons: Visible only if User is Sitter AND Status is PENDING */}
              {auth.role === "SITTER" && booking.status === "PENDING" && (
                <div className="booking-actions">
                  <button
                    onClick={() => acceptBooking(booking.bookingId)}
                    className="action-btn accept"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineBooking(booking.bookingId)}
                    className="action-btn decline"
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
                    className="action-btn complete"
                    style={{ width: "100%" }}
                  >
                    Mark as Completed
                  </button>
                </div>
              )}

              {/* Completion message & Review Button */}
              {booking.status === "COMPLETED" && (
                <div className="review-section">
                  <p className="review-completed-msg">Service Completed ✅</p>

                  {auth.role === "OWNER" && !booking.review && (
                    <button
                      onClick={() => openReviewModal(booking.bookingId)}
                      className="review-btn-write"
                    >
                      Write a Review
                    </button>
                  )}
                  {auth.role === "OWNER" && booking.review && (
                    <p className="review-submitted-msg">You reviewed this booking.</p>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={submitReview}
        loading={reviewLoading}
      />
    </div>
  );
}