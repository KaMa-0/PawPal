import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getMyProfile } from '../controllers/user.controller';

const router = Router();

// GET http://localhost:3000/api/users/me
router.get('/me', authenticateToken, getMyProfile);

export default router;