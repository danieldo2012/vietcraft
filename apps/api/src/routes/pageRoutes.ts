import { Router } from 'express';
import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage
} from '../controllers/pageController';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public: get published pages (or all pages if authenticated as admin/editor)
router.get('/', optionalAuthenticate, getPages);

// Public: get page by slug (or drafts if authenticated as admin/editor)
router.get('/:slug', optionalAuthenticate, getPageBySlug);

// Admin: CRUD operations
router.post('/', authenticate, requireRole(['admin', 'editor']), createPage);
router.put('/:id', authenticate, requireRole(['admin', 'editor']), updatePage);
router.delete('/:id', authenticate, requireRole('admin'), deletePage);

export default router;
