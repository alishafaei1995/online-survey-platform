import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  listSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  duplicateSurvey,
} from '../controllers/surveyController.js';
import { getReport, exportCsv, exportExcel, getQrCode } from '../controllers/reportController.js';
import { createInvite, listInvites } from '../controllers/inviteController.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listSurveys));
router.post('/', asyncHandler(createSurvey));
router.get('/:id', asyncHandler(getSurvey));
router.put('/:id', asyncHandler(updateSurvey));
router.delete('/:id', asyncHandler(deleteSurvey));
router.post('/:id/duplicate', asyncHandler(duplicateSurvey));

router.get('/:id/report', asyncHandler(getReport));
router.get('/:id/export/csv', asyncHandler(exportCsv));
router.get('/:id/export/excel', asyncHandler(exportExcel));
router.get('/:id/qrcode', asyncHandler(getQrCode));

router.get('/:id/invites', asyncHandler(listInvites));
router.post('/:id/invites', asyncHandler(createInvite));

export default router;
