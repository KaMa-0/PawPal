import { Router } from 'express';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth.middleware';
import { getMyProfile, getPetSitters, getSitterProfile } from '../controllers/user.controller';
import { uploadProfileImage, updateAboutText, deleteProfileImage, setAvatar } from '../controllers/user.controller';
import { addFavorite, removeFavorite, getMyFavorites } from '../controllers/user.controller';

const router = Router();

// GET http://localhost:3000/api/users/me
router.get('/me', authenticateToken, getMyProfile);

router.post('/me/upload-profile-image', authenticateToken, uploadProfileImage);
router.put('/me/profile-images/:id/avatar', authenticateToken, setAvatar);
router.delete('/me/profile-images/:id', authenticateToken, deleteProfileImage);
router.put('/me/about', authenticateToken, updateAboutText);

// Favorites
router.get('/me/favorites', authenticateToken, getMyFavorites);
router.post('/me/favorites/:sitterId', authenticateToken, addFavorite);
router.delete('/me/favorites/:sitterId', authenticateToken, removeFavorite);

// GET http://localhost:3000/api/users/sitters
router.get('/sitters', optionalAuthenticate, getPetSitters);

// GET http://localhost:3000/api/users/sitter/:id (Public Profile)
router.get('/sitter/:id', optionalAuthenticate, getSitterProfile);

export default router;
