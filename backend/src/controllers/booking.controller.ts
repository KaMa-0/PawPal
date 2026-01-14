import { AuthRequest } from '../types/auth.types';
import { Response } from 'express';
import {
  createBooking,
  respondToBooking,
  completeBooking,
  getBookingsForUser,
} from '../services/booking.service';

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

