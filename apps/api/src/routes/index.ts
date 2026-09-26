import { Router } from 'express';
import authRoutes from './authRoutes';
import materialRoutes from './materialRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import postRoutes from './postRoutes';
import homepageRoutes from './homepageRoutes';
import settingsRoutes from './settingsRoutes';
import newsletterRoutes from './newsletterRoutes';
import contactRoutes from './contactRoutes';
import searchRoutes from './searchRoutes';
import analyticsRoutes from './analyticsRoutes';
import uploadRoutes from './uploadRoutes';

import headerRoutes from './headerRoutes';
import navigationRoutes from './navigationRoutes';
import footerRoutes from './footerRoutes';
import pageRoutes from './pageRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/materials', materialRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/posts', postRoutes);
router.use('/articles', postRoutes); // Alias for consistency with public /articles route
router.use('/homepage', homepageRoutes);
router.use('/header', headerRoutes);
router.use('/navigation', navigationRoutes);
router.use('/footer', footerRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingsRoutes);
router.use('/site-settings', settingsRoutes); // Alias for consistency with standard spec
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);
router.use('/search', searchRoutes);
router.use('/admin', analyticsRoutes);
router.use('/upload', uploadRoutes);

export default router;
