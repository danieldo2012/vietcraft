import { Router } from 'express';
import {
  getSettings,
  adminGetSettings,
  adminUpdateSettings
} from '../controllers/settingsController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { siteSettingsSchema } from '@vietcraft/shared';

const router = Router();

// Public route
router.get('/', getSettings);

// Admin routes
router.get('/admin', authenticate, adminGetSettings);
router.put('/', authenticate, requireRole(['admin']), validateBody(siteSettingsSchema), adminUpdateSettings);
router.put('/admin', authenticate, requireRole(['admin']), validateBody(siteSettingsSchema), adminUpdateSettings);

export default router;
