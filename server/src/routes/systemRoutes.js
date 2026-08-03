import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getVersion } from '../controllers/systemController.js';

const router = Router();

router.get('/version', requireAuth, requireAdmin, asyncHandler(getVersion));

export default router;
