import { Router } from 'express';
import { getDashboardStats, getClickAnalytics } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, requireRole(['admin', 'editor']), getDashboardStats);
router.get('/clicks', authenticate, requireRole(['admin', 'editor']), getClickAnalytics);

export default router;
