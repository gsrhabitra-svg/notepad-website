import { Router } from 'express';
import { getPageByNodeId, updatePage } from '../controllers/pageController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:nodeId', getPageByNodeId);
router.patch('/:id', updatePage);

export default router;
