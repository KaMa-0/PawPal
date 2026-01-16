import { useEffect, useState } from "react";
import { getAuth } from "../auth/authStore";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewModal from "../components/ReviewModal";
import "./bookings.css";

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
      <div className="mybookings-page-wrapper">
        <Navbar />
        <div className="mybookings-container">
          <p className="empty-state">Please login first.</p>
          <button onClick={() => navigate("/login")} className="logout-button mt-1">
            Go to Login
          </button>
        </div>
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
    <div className="mybookings-page-wrapper">
      <Navbar /> {/* Navbar En Üstte */}

      <div className="mybookings-content">
        <div className="mybookings-container">
          <div className="bookings-header-row">
            <h1>My Bookings</h1>
            {/* Back butonu opsiyonel oldu çünkü Navbar var, ama istersen tutabilirsin */}
          </div>

          {bookings.length === 0 ? (
            <p className="empty-state">No bookings found.</p>
          ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking.bookingId} className="booking-card">
                  {/* ... Kart içeriği aynı (önceki cevaptaki gibi temizlenmiş hali) ... */}
                  <div className="booking-info">
                    <p><strong>ID:</strong> {booking.bookingId}</p>
                    <p><strong>Owner:</strong> {booking.owner.user.username}</p>
                    <p><strong>Sitter:</strong> {booking.sitter.user.username}</p>
                    <p><strong>Date:</strong> {new Date(booking.requestDate).toLocaleDateString()}</p>
                    <p><strong>Details:</strong> {booking.details}</p>
                    <p><strong>Status:</strong>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </p>
                    {booking.review && <p className="review-rating">Rating: {booking.review.rating}/5 ⭐</p>}
                  </div>

                  {/* ... Butonlar aynı ... */}
                  {auth.role === "SITTER" && booking.status === "PENDING" && (
                    <div className="booking-actions">
                      <button onClick={() => acceptBooking(booking.bookingId)} className="action-btn accept">Accept</button>
                      <button onClick={() => declineBooking(booking.bookingId)} className="action-btn decline">Decline</button>
                    </div>
                  )}

                  {auth.role === "OWNER" && booking.status === "ACCEPTED" && (
                    <div className="owner-actions">
                      <button onClick={() => completeBooking(booking.bookingId)} className="action-btn complete full-width">Mark as Completed</button>
                    </div>
                  )}

                  {/* ... Review kısmı aynı ... */}
                  {booking.status === "COMPLETED" && (
                    <div className="review-section">
                      {/* ... */}
                      {auth.role === "OWNER" && !booking.review && (
                        <button onClick={() => openReviewModal(booking.bookingId)} className="review-btn-write">Write a Review</button>
                      )}
                      {/* ... */}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={submitReview}
        loading={reviewLoading}
      />
      <Footer />
    </div>
  );
}