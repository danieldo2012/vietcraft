import { Router } from 'express';
import { subscribe, adminGetSubscribers } from '../controllers/newsletterController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { newsletterSchema } from '@vietcraft/shared';

const router = Router();

// Public subscription
router.post('/subscribe', validateBody(newsletterSchema), subscribe);

// Admin subscriber list
router.get('/admin', authenticate, requireRole(['admin', 'editor']), adminGetSubscribers);

export default router;
