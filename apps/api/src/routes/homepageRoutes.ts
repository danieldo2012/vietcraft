import { Router } from 'express';
import {
  getHomepage,
  adminGetHomepage,
  adminUpdateHomepage
} from '../controllers/homepageController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { homepageSchema } from '@vietcraft/shared';

const router = Router();

// Public route
router.get('/', getHomepage);

// Admin routes
router.get('/admin', authenticate, adminGetHomepage);
router.put('/', authenticate, requireRole(['admin', 'editor']), validateBody(homepageSchema.partial()), adminUpdateHomepage);
router.put('/admin', authenticate, requireRole(['admin', 'editor']), validateBody(homepageSchema.partial()), adminUpdateHomepage);

export default router;
