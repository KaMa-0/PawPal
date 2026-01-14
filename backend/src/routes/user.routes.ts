import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getMyProfile, getPetSitters } from '../controllers/user.controller';
import { uploadProfileImage, updateAboutText } from '../controllers/user.controller';

const router = Router();

// GET http://localhost:3000/api/users/me
router.get('/me', authenticateToken, getMyProfile);

router.post('/me/upload-profile-image', authenticateToken, uploadProfileImage);
router.put('/me/about', authenticateToken, updateAboutText);

// GET http://localhost:3000/api/users/sitters
router.get('/sitters', getPetSitters);

export default router;
