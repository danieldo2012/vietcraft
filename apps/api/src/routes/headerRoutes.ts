import { Router } from 'express';
import { getHeaderSettings, updateHeaderSettings } from '../controllers/headerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public: get header configuration
router.get('/', getHeaderSettings);

// Admin: update header configuration
router.put('/', authenticate, requireRole('admin'), updateHeaderSettings);

export default router;
