import { useEffect, useState } from "react";
import { getAuth } from "../auth/authStore";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewModal from "../components/ReviewModal";
import { Calendar, User, User as UserStart, Star, Check, X, CheckCircle } from "lucide-react";
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
                  {/* Card Header for Context */}
                  <div className="card-header">
                    <div className="header-top-row">
                      <span className="booking-id-text">Booking #{booking.bookingId}</span>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="booking-date-row">
                      <Calendar size={14} className="icon" />
                      <span>{new Date(booking.requestDate).toLocaleDateString(undefined, {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Card Body with Vertical List */}
                  <div className="card-body">
                    <div className="participants-list">
                      <div className="participant-item">
                        <div className="avatar-placeholder">
                          <User size={18} />
                        </div>
                        <div className="participant-info">
                          <span className="participant-name">{booking.owner.user.username}</span>
                          <span className="participant-role">Owner</span>
                        </div>
                      </div>
                      <div className="participant-item">
                        <div className="avatar-placeholder">
                          <UserStart size={18} />
                        </div>
                        <div className="participant-info">
                          <span className="participant-name">{booking.sitter.user.username}</span>
                          <span className="participant-role">Sitter</span>
                        </div>
                      </div>
                    </div>

                    {booking.review && (
                      <div className="review-display">
                        <div className="review-stars-row">
                          <Star size={14} className="fill-current" />
                          <span>{booking.review.rating}/5</span>
                        </div>
                        {booking.review.text && <p className="review-preview">"{booking.review.text}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Card Footer with Actions */}
                  <div className="card-footer">
                    {auth.role === "SITTER" && booking.status === "PENDING" && (
                      <div className="button-group">
                        <button onClick={() => acceptBooking(booking.bookingId)} className="btn btn-accept">
                          <Check size={16} /> Accept
                        </button>
                        <button onClick={() => declineBooking(booking.bookingId)} className="btn btn-decline">
                          <X size={16} /> Decline
                        </button>
                      </div>
                    )}

                    {auth.role === "OWNER" && booking.status === "ACCEPTED" && (
                      <div className="button-group">
                        <button onClick={() => completeBooking(booking.bookingId)} className="btn btn-primary full-width">
                          <CheckCircle size={16} /> Mark as Completed
                        </button>
                      </div>
                    )}

                    {booking.status === "COMPLETED" && auth.role === "OWNER" && !booking.review && (
                      <div className="button-group">
                        <button onClick={() => openReviewModal(booking.bookingId)} className="btn btn-secondary full-width">
                          <Star size={16} /> Write a Review
                        </button>
                      </div>
                    )}
                  </div>
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
