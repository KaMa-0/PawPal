import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  sendBookingRequest,
  respondBookingRequest,
  markBookingCompleted,
  getMyBookings,
  addBookingReview,
} from '../controllers/booking.controller';

const router = Router();

router.post('/request', authenticateToken, sendBookingRequest);
router.post('/respond', authenticateToken, respondBookingRequest);
router.post('/complete', authenticateToken, markBookingCompleted);
router.post('/review', authenticateToken, addBookingReview);
router.get('/my', authenticateToken, getMyBookings);

export default router;

