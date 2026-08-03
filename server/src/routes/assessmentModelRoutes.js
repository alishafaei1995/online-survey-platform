import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listAssessmentModels, getAssessmentModel, instantiateAssessmentModel } from '../controllers/assessmentModelController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listAssessmentModels));
router.get('/:key', asyncHandler(getAssessmentModel));
router.post('/:key/instantiate', asyncHandler(instantiateAssessmentModel));

export default router;
