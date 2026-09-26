import { Router } from 'express';
import { unifiedSearch } from '../controllers/searchController';
import { validateQuery } from '../middleware/validate';
import { searchQuerySchema } from '@vietcraft/shared';

const router = Router();

router.get('/', validateQuery(searchQuerySchema), unifiedSearch);

export default router;
