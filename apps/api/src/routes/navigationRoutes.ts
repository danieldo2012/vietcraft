import { Router } from 'express';
import { getNavigationSettings, updateNavigationSettings } from '../controllers/headerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public: get navigation configuration
router.get('/', getNavigationSettings);

// Admin: update navigation configuration
router.put('/', authenticate, requireRole(['admin', 'editor']), updateNavigationSettings);

export default router;
