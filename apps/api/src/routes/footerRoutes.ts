import { Router } from 'express';
import { getFooterSettings, updateFooterSettings } from '../controllers/footerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public: get footer configuration
router.get('/', getFooterSettings);

// Admin: update footer configuration
router.put('/', authenticate, requireRole('admin'), updateFooterSettings);

export default router;
