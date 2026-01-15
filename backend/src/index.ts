import "dotenv/config";
import express from "express";
import cors from "cors";
import path from 'path';
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import bookingRoutes from "./routes/booking.routes";
import certificationRoutes from "./routes/certification.routes";
import reviewRoutes from "./routes/review.routes";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/reviews", reviewRoutes);

// Test Endpoint
app.get("/", (_req, res) => {
    res.send("PawPal Backend läuft!");
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Static Content
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
