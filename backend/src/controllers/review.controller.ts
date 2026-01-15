import { AuthRequest } from '../types/auth.types';
import { Response } from 'express';
import { createReview } from '../services/review.service';

export const postReview = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { bookingId, rating, text } = req.body;

        if (!bookingId || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const review = await createReview(req.user.userId, bookingId, rating, text);
        res.json(review);
    } catch (err: any) {
        console.error(err);
        if (err.message === "Booking not found" || err.message === "Not authorized to review this booking") {
            res.status(403).json({ message: err.message });
        } else if (err.message === "Review already exists for this booking") {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Failed to create review' });
        }
    }
};
