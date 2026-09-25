import { Router } from 'express';
import { getProfile, updateProfile, deleteAccount } from '../controllers/userController.js';
import { searchNotes } from '../controllers/searchController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getDBStatus } from '../config/db.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.delete('/account', deleteAccount);
router.get('/search', searchNotes);
router.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: getDBStatus(),
  });
});

export default router;
