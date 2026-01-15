import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.middleware';
import {
  submitCertification,
  getPending,
  approve,
  reject,
  getStatus,
  getMyHistory,
  getAllHistory
} from '../controllers/certification.controller';

const router = Router();

// POST - Sitter submits certification request
router.post('/submit', authenticate, submitCertification);

// GET - Admin views pending requests
router.get('/pending', authenticate, adminOnly, getPending);

// POST - Admin approves certification
router.post('/approve', authenticate, adminOnly, approve);

// POST - Admin rejects certification
router.post('/reject', authenticate, adminOnly, reject);

// GET - Check if sitter is certified
router.get('/status/:sitterId', getStatus);

// GET - Sitter views their history
router.get('/my-history', authenticate, getMyHistory);

// GET - Admin views all history
router.get('/all', authenticate, adminOnly, getAllHistory);

export default router;

