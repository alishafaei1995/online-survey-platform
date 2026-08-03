import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listUsers, createUser, setUserActive, deleteUser } from '../controllers/userController.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(listUsers));
router.post('/', asyncHandler(createUser));
router.patch('/:id/active', asyncHandler(setUserActive));
router.delete('/:id', asyncHandler(deleteUser));

export default router;
