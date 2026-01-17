import { Router } from 'express';
import { register, login, changeUserPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST http://localhost:3000/api/auth/register
router.post('/register', register);

// POST http://localhost:3000/api/auth/login
router.post('/login', login);


// POST http://localhost:3000/api/auth/change-password
router.post('/change-password', authenticate, changeUserPassword);

export default router;