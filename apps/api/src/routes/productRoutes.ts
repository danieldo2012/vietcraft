import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  trackAffiliateClick,
  adminGetProducts,
  adminGetProductById,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminScrapeAmazonProduct
} from '../controllers/productController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { productSchema } from '@vietcraft/shared';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/:id/click', trackAffiliateClick);

// Admin routes
router.get('/admin/all', authenticate, adminGetProducts);
router.get('/admin/:id', authenticate, adminGetProductById);
router.post('/admin/scrape-amazon', authenticate, requireRole(['admin', 'editor']), adminScrapeAmazonProduct);
router.post('/', authenticate, requireRole(['admin', 'editor']), validateBody(productSchema), adminCreateProduct);
router.put('/:id', authenticate, requireRole(['admin', 'editor']), adminUpdateProduct);
router.delete('/:id', authenticate, requireRole(['admin']), adminDeleteProduct);

export default router;
