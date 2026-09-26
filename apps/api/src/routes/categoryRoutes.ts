import { Router } from 'express';
import {
  getCategories,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { categorySchema } from '@vietcraft/shared';

const router = Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.get('/admin/all', authenticate, adminGetCategories);
router.post('/', authenticate, requireRole(['admin', 'editor']), validateBody(categorySchema), adminCreateCategory);
router.put('/:id', authenticate, requireRole(['admin', 'editor']), adminUpdateCategory);
router.delete('/:id', authenticate, requireRole(['admin']), adminDeleteCategory);

export default router;
