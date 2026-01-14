import { Router } from 'express';
import { register, login, requestPasswordReset, resetUserPassword } from '../controllers/auth.controller';

const router = Router();

// POST http://localhost:3000/api/auth/register
router.post('/register', register);

// POST http://localhost:3000/api/auth/login
router.post('/login', login);

// POST http://localhost:3000/api/auth/forgot-password
router.post('/forgot-password', requestPasswordReset);

// POST http://localhost:3000/api/auth/reset-password
router.post('/reset-password', resetUserPassword);

export default router;