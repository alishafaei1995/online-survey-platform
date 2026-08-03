import Survey from '../models/Survey.js';
import Response from '../models/Response.js';

function ownerFilter(req) {
  return req.user.role === 'admin' ? {} : { createdBy: req.user.id };
}

export async function listSurveys(req, res) {
  let query = Survey.find(ownerFilter(req))
    .sort({ createdAt: -1 })
    .select('title status schedule createdAt updatedAt createdBy');

  if (req.user.role === 'admin') query = query.populate('createdBy', 'name email');

  const surveys = await query;
  res.json({ surveys });
}

export async function getSurvey(req, res) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });
  res.json({ survey });
}

export async function createSurvey(req, res) {
  const { title, description, questions, settings, welcomeMessage, endMessage, schedule, status, modelKey, modelVersion } = req.body;
  if (!title?.fa && !title?.en) return res.status(400).json({ message: 'Title is required' });

  const survey = await Survey.create({
    title,
    description,
    questions: (questions || []).map((q, idx) => ({ ...q, order: idx })),
    settings,
    welcomeMessage,
    endMessage,
    schedule,
    status: status || 'draft',
    createdBy: req.user.id,
    modelKey,
    modelVersion,
  });
  res.status(201).json({ survey });
}

export async function updateSurvey(req, res) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const { title, description, questions, settings, welcomeMessage, endMessage, schedule, status, modelKey, modelVersion } = req.body;
  if (title) survey.title = title;
  if (description) survey.description = description;
  if (questions) survey.questions = questions.map((q, idx) => ({ ...q, order: idx }));
  if (settings) survey.settings = settings;
  if (welcomeMessage) survey.welcomeMessage = welcomeMessage;
  if (endMessage) survey.endMessage = endMessage;
  if (schedule) survey.schedule = schedule;
  if (status) survey.status = status;
  if (modelKey) survey.modelKey = modelKey;
  if (modelVersion) survey.modelVersion = modelVersion;

  await survey.save();
  res.json({ survey });
}

export async function deleteSurvey(req, res) {
  const survey = await Survey.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });
  await Response.deleteMany({ surveyId: survey._id });
  res.json({ message: 'Deleted' });
}

export async function duplicateSurvey(req, res) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const copy = survey.toObject();
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  copy.title = { fa: `${copy.title?.fa || ''} (کپی)`.trim(), en: `${copy.title?.en || ''} (Copy)`.trim() };
  copy.status = 'draft';
  copy.schedule = { startAt: undefined, endAt: undefined };
  copy.createdBy = req.user.id;

  const newSurvey = await Survey.create(copy);
  res.status(201).json({ survey: newSurvey });
}
