import { Router } from 'express';
import { getPublicSurvey, startResponse, submitResponse } from '../controllers/publicController.js';
import { publicSubmitLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/surveys/:id', asyncHandler(getPublicSurvey));
router.post('/surveys/:id/start', publicSubmitLimiter, asyncHandler(startResponse));
router.post('/surveys/:id/submit', publicSubmitLimiter, asyncHandler(submitResponse));

export default router;
