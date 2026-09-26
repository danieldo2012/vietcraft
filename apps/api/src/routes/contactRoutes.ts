import { Router } from 'express';
import {
  submitContact,
  getContactMessages,
  markContactMessageRead
} from '../controllers/contactController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public contact submission
router.post('/', submitContact);

// Admin: view and manage contact messages
router.get('/', authenticate, requireRole('admin'), getContactMessages);
router.patch('/:id/read', authenticate, requireRole('admin'), markContactMessageRead);

export default router;
