import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  sendBookingRequest,
  respondBookingRequest,
  markBookingCompleted,
  getMyBookings,
} from '../controllers/booking.controller';

const router = Router();

router.post('/request', authenticateToken, sendBookingRequest);
router.post('/respond', authenticateToken, respondBookingRequest);
router.post('/complete', authenticateToken, markBookingCompleted);
router.get('/my', authenticateToken, getMyBookings);

export default router;

