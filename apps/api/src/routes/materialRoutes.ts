import { Router } from 'express';
import {
  getMaterials,
  getMaterialBySlug,
  adminGetMaterials,
  adminCreateMaterial,
  adminUpdateMaterial,
  adminDeleteMaterial
} from '../controllers/materialController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { materialSchema } from '@vietcraft/shared';

const router = Router();

// Public routes
router.get('/', getMaterials);
router.get('/:slug', getMaterialBySlug);

// Admin routes
router.get('/admin/all', authenticate, adminGetMaterials);
router.post('/', authenticate, requireRole(['admin', 'editor']), validateBody(materialSchema), adminCreateMaterial);
router.put('/:id', authenticate, requireRole(['admin', 'editor']), adminUpdateMaterial);
router.delete('/:id', authenticate, requireRole(['admin']), adminDeleteMaterial);

export default router;
