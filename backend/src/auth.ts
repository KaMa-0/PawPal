import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type Role = "OWNER" | "SITTER" | "ADMIN";

const router = Router();

const allowedRoles: Role[] = ["OWNER", "SITTER", "ADMIN"];

function signToken(payload: { userId: string; role: Role }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

// Mock register (returns token directly for now)
router.post("/register", (req: Request, res: Response) => {
  const { email, role } = req.body as { email?: string; role?: Role };

  if (!email) return res.status(400).json({ message: "email is required" });
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "invalid role" });
  }

  const userId = `u_${Date.now()}`;
  const token = signToken({ userId, role });

  return res.json({ token, user: { userId, email, role } });
});

// Mock login (accepts any email/password; role chosen by input)
router.post("/login", (req: Request, res: Response) => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: Role;
  };

  if (!email) return res.status(400).json({ message: "email is required" });
  if (!password) return res.status(400).json({ message: "password is required" });
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "invalid role" });
  }

  const userId = `u_${Date.now()}`;
  const token = signToken({ userId, role });

  return res.json({ token, user: { userId, email, role } });
});

export default router;