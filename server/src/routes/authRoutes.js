import { Router } from 'express';
import { login, me, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.post('/change-password', requireAuth, asyncHandler(changePassword));

export default router;
