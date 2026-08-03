import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listParticipants, createParticipant, setParticipantActive } from '../controllers/participantController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listParticipants));
router.post('/', asyncHandler(createParticipant));
router.patch('/:id/active', asyncHandler(setParticipantActive));

export default router;
