import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./auth";

const app = express();
const port = process.env.PORT || 3000;

/**
 * Middleware (ORDER MATTERS)
 */
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:8080",
  })
);

/**
 * Health check
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Temporary root endpoint (optional, can be removed later)
 */
app.get("/", (_req, res) => {
  res.json({ message: "PawPal Backend says Hi!" });
});

/**
 * Auth routes
 */
app.use("/auth", authRouter);

/**
 * Start server
 */
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});