// booking.controller.ts
import { AuthRequest } from '../types/auth.types';
import { Response } from 'express';
import {
  createBooking,
  respondToBooking,
  completeBooking,
  getBookingsForUser,
  createReview,
} from '../services/booking.service';

// NEU: Imports hinzufügen
import prisma from '../config/prisma';
import { updateSitterAverageRating } from '../services/user.service';

export const sendBookingRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { sitterId, details } = req.body;

    const booking = await createBooking(req.user.userId, sitterId, details);
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

export const respondBookingRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { bookingId, accept } = req.body;

    const booking = await respondToBooking(bookingId, accept);
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to respond to booking' });
  }
};

export const markBookingCompleted = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { bookingId } = req.body;

    const booking = await completeBooking(bookingId);
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to complete booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await getBookingsForUser(req.user.userId, req.user.role);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

export const addBookingReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { bookingId, rating, text } = req.body;

    // 1. Review erstellen (wie bisher)
    const review = await createReview(bookingId, rating, text);

    // 2. Sitter ID herausfinden und Durchschnitt updaten
    const booking = await prisma.booking.findUnique({
      where: { bookingId: Number(bookingId) },
      select: { sitterId: true }
    });

    if (booking) {
      // Hier wird die Berechnung angestoßen
      await updateSitterAverageRating(booking.sitterId);
    }

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create review' });
  }
};