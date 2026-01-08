import { useEffect, useState } from "react";
import { getAuth } from "../auth/authStore";
import api from "../services/api";
import "./bookings.css";

type BookingStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";

type Booking = {
  bookingId: number;
  owner: { user: { userId: number; username: string } };
  sitter: { user: { userId: number; username: string } };
  status: BookingStatus;
  details?: string;
  requestDate: string;
};


export default function MyBookings() {
  const auth = getAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);

  if (!auth || auth.role !== "SITTER") {
    return <p style={{ padding: "2rem" }}>Only pet sitters can view this page.</p>;
  }

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await api.get("/api/bookings/my"); // backend endpoint to get bookings for the sitter
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  }

  const handleBookingAction = async (bookingId: number, action: "ACCEPTED" | "DECLINED") => {
    setProcessingBookingId(bookingId);
    try {
      await api.patch(`/api/bookings/${bookingId}`, { status: action });
      // Update state locally
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? { ...b, status: action } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status");
    } finally {
      setProcessingBookingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="mybookings-container">
      <h1 className="page-title">My Bookings</h1>

      {loading ? (
        <p className="empty-state">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="empty-state">No bookings found.</p>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="booking-card">
              <div className="booking-owner">
                Owner: <strong>{booking.owner.user.username}</strong>
              </div>
              <div className="booking-details">
                {booking.details || "No details provided."}
              </div>
              <div className="booking-meta">
                Requested: {new Date(booking.requestDate).toLocaleString()}
              </div>
              <div className="booking-status">
                Status: <strong>{booking.status}</strong>
              </div>

              {booking.status === "PENDING" && (
                <div className="booking-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <button
                    className="login-button"
                    style={{ flex: 1, backgroundColor: "#4caf50" }}
                    disabled={processingBookingId === booking.bookingId}
                    onClick={() => handleBookingAction(booking.bookingId, "ACCEPTED")}
                  >
                    {processingBookingId === booking.bookingId ? "Processing..." : "Accept"}
                  </button>

                  <button
                    className="login-button"
                    style={{ flex: 1, backgroundColor: "#f44336" }}
                    disabled={processingBookingId === booking.bookingId}
                    onClick={() => handleBookingAction(booking.bookingId, "DECLINED")}
                  >
                    {processingBookingId === booking.bookingId ? "Processing..." : "Decline"}
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

