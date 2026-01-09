import { useEffect, useState } from "react";
import { getAuth } from "../auth/authStore";
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
};

export default function Bookings() {
  const auth = getAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

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

  return (
    <div className="mybookings-container">
      <h1>My Bookings</h1>

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

            </div>
          ))}
        </div>
      )}
    </div>
  );
}