import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getMyProfile, getPetSitters } from '../controllers/user.controller';
import { uploadProfileImage, updateAboutText } from '../controllers/user.controller';
import { toggleFavorite, getMyFavorites, getMyFavoriteIds, getSitterProfile } from '../controllers/user.controller';

const router = Router();

// GET http://localhost:3000/api/users/me
router.get('/me', authenticateToken, getMyProfile);

router.post('/me/upload-profile-image', authenticateToken, uploadProfileImage);
router.put('/me/about', authenticateToken, updateAboutText);
router.get('/sitters/:id', getSitterProfile);

// GET http://localhost:3000/api/users/sitters
// @ts-ignore
router.get('/sitters', getPetSitters);

// Favorite Routes
router.get('/favorites', authenticateToken, getMyFavorites);
router.get('/favorites/ids', authenticateToken, getMyFavoriteIds);
router.post('/favorites/:sitterId', authenticateToken, toggleFavorite);

export default router;
