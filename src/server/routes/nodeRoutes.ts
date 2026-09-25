import { Router } from 'express';
import {
  getNodes,
  createNode,
  updateNode,
  deleteNode,
  moveNode,
  reorderNodes,
} from '../controllers/nodeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getNodes);
router.post('/', createNode);
router.patch('/reorder', reorderNodes);
router.patch('/:id', updateNode);
router.delete('/:id', deleteNode);
router.patch('/:id/move', moveNode);

export default router;
