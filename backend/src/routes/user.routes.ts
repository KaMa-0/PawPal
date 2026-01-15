import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getMyProfile, getPetSitters, getSitterProfile } from '../controllers/user.controller';
import { uploadProfileImage, updateAboutText, deleteProfileImage, setAvatar } from '../controllers/user.controller';

const router = Router();

// GET http://localhost:3000/api/users/me
router.get('/me', authenticateToken, getMyProfile);

router.post('/me/upload-profile-image', authenticateToken, uploadProfileImage);
router.put('/me/profile-images/:id/avatar', authenticateToken, setAvatar);
router.delete('/me/profile-images/:id', authenticateToken, deleteProfileImage);
router.put('/me/about', authenticateToken, updateAboutText);

// GET http://localhost:3000/api/users/sitters
router.get('/sitters', getPetSitters);

// GET http://localhost:3000/api/users/sitter/:id (Public Profile)
router.get('/sitter/:id', getSitterProfile);

export default router;
