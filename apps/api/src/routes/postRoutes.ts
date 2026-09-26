import { Router } from 'express';
import {
  getPosts,
  getPostBySlug,
  adminGetPosts,
  adminGetPostById,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost
} from '../controllers/postController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { postSchema } from '@vietcraft/shared';

const router = Router();

// Public routes
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);

// Admin routes
router.get('/admin/all', authenticate, adminGetPosts);
router.get('/admin/:id', authenticate, adminGetPostById);
router.post('/', authenticate, requireRole(['admin', 'editor']), validateBody(postSchema), adminCreatePost);
router.put('/:id', authenticate, requireRole(['admin', 'editor']), adminUpdatePost);
router.delete('/:id', authenticate, requireRole(['admin']), adminDeletePost);

export default router;
