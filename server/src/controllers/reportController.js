import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Participant from '../models/Participant.js';
import { buildCsv, buildExcelBuffer } from '../services/exportService.js';
import { generateQrDataUrl } from '../services/qrService.js';
import { getModelDefinition } from '../config/assessmentModels/index.js';
import { buildModelReport } from '../services/scoringService.js';

async function buildParticipantsById(responses) {
  const ids = new Set();
  for (const r of responses) {
    if (r.subjectParticipantId) ids.add(String(r.subjectParticipantId));
    if (r.raterParticipantId) ids.add(String(r.raterParticipantId));
  }
  if (ids.size === 0) return new Map();
  const participants = await Participant.find({ _id: { $in: [...ids] } });
  return new Map(participants.map((p) => [String(p._id), p]));
}

function ownerFilter(req) {
  return req.user.role === 'admin' ? {} : { createdBy: req.user.id };
}

async function loadSurveyAndResponses(req) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return { survey: null };

  const dateFilter = {};
  if (req.query.startDate) dateFilter.$gte = new Date(req.query.startDate);
  if (req.query.endDate) dateFilter.$lte = new Date(req.query.endDate);
  const hasDateFilter = Object.keys(dateFilter).length > 0;

  const startedMatch = { surveyId: survey._id };
  if (hasDateFilter) startedMatch.startedAt = dateFilter;

  const completedMatch = { surveyId: survey._id, completed: true };
  if (hasDateFilter) completedMatch.submittedAt = dateFilter;

  const allStarted = await Response.countDocuments(startedMatch);
  const completedResponses = await Response.find(completedMatch).sort({ submittedAt: -1 });

  return { survey, allStarted, completedResponses };
}

export async function getReport(req, res) {
  const { survey, allStarted, completedResponses } = await loadSurveyAndResponses(req);
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const completedCount = completedResponses.length;
  const targetCount = survey.settings?.targetCount;
  const participationRate = targetCount ? completedCount / targetCount : null;
  const completionRate = allStarted > 0 ? completedCount / allStarted : 0;

  const questions = [...survey.questions].sort((a, b) => a.order - b.order);
  const questionStats = questions.map((q) => {
    const values = completedResponses
      .map((r) => r.answers.find((a) => String(a.questionId) === String(q._id))?.value)
      .filter((v) => v !== undefined && v !== null && v !== '');

    const base = { questionId: q._id, title: q.title, type: q.type, answeredCount: values.length };

    if (['single_choice', 'likert', 'multiple_choice'].includes(q.type)) {
      const freq = {};
      for (const opt of q.options) freq[opt.value] = 0;
      for (const v of values) {
        const arr = Array.isArray(v) ? v : [v];
        for (const item of arr) freq[item] = (freq[item] || 0) + 1;
      }
      return {
        ...base,
        frequency: q.options.map((opt) => ({ value: opt.value, label: opt.label, count: freq[opt.value] || 0 })),
      };
    }

    if (q.type === 'matrix') {
      const rowStats = q.matrixRows.map((row) => {
        const freq = {};
        for (const opt of q.options) freq[opt.value] = 0;
        for (const v of values) {
          const colValue = v?.[row.value];
          if (colValue !== undefined) freq[colValue] = (freq[colValue] || 0) + 1;
        }
        return {
          row: row.label,
          frequency: q.options.map((opt) => ({ value: opt.value, label: opt.label, count: freq[opt.value] || 0 })),
        };
      });
      return { ...base, rowStats };
    }

    if (q.type === 'numeric') {
      const nums = values.map(Number).filter((n) => !Number.isNaN(n));
      const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
      const min = nums.length ? Math.min(...nums) : null;
      const max = nums.length ? Math.max(...nums) : null;
      return { ...base, stats: { avg, min, max } };
    }

    return base;
  });

  let model = null;
  const modelDef = survey.modelKey ? getModelDefinition(survey.modelKey) : null;
  if (modelDef) {
    const participantsById = await buildParticipantsById(completedResponses);
    model = buildModelReport(survey, completedResponses, modelDef, participantsById);
  }

  res.json({
    survey: { _id: survey._id, title: survey.title },
    metrics: { allStarted, completedCount, participationRate, completionRate, targetCount },
    questionStats,
    model,
  });
}

async function resolveModelReport(survey, completedResponses) {
  const modelDef = survey.modelKey ? getModelDefinition(survey.modelKey) : null;
  if (!modelDef) return null;
  const participantsById = await buildParticipantsById(completedResponses);
  return buildModelReport(survey, completedResponses, modelDef, participantsById);
}

export async function exportCsv(req, res) {
  const { survey, completedResponses } = await loadSurveyAndResponses(req);
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const lang = req.query.lang === 'en' ? 'en' : 'fa';
  const modelReport = await resolveModelReport(survey, completedResponses);
  const csv = buildCsv(survey, completedResponses, lang, modelReport);
  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.attachment(`survey-${survey._id}.csv`);
  res.send('﻿' + csv);
}

export async function exportExcel(req, res) {
  const { survey, completedResponses } = await loadSurveyAndResponses(req);
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const lang = req.query.lang === 'en' ? 'en' : 'fa';
  const modelReport = await resolveModelReport(survey, completedResponses);
  const buffer = await buildExcelBuffer(survey, completedResponses, lang, modelReport);
  res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.attachment(`survey-${survey._id}.xlsx`);
  res.send(Buffer.from(buffer));
}

export async function getQrCode(req, res) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/s/${survey._id}`;
  const dataUrl = await generateQrDataUrl(link);
  res.json({ link, qrDataUrl: dataUrl });
}
