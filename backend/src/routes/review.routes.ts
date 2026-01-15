import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { postReview } from '../controllers/review.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', postReview);

export default router;
