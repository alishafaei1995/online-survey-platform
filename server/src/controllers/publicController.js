import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import { hashIp } from '../utils/ipHash.js';
import { validateAnswers } from '../utils/validateAnswers.js';

function statusMessage(survey) {
  if (survey.status === 'draft') return 'not_published';
  if (survey.status === 'closed') return 'closed';
  const now = new Date();
  if (survey.schedule?.startAt && now < survey.schedule.startAt) return 'not_started';
  if (survey.schedule?.endAt && now > survey.schedule.endAt) return 'ended';
  return 'open';
}

export async function getPublicSurvey(req, res) {
  const survey = await Survey.findById(req.params.id);
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const state = statusMessage(survey);
  if (state !== 'open') {
    return res.json({
      open: false,
      state,
      title: survey.title,
      endMessage: survey.endMessage,
    });
  }

  let alreadySubmitted = false;
  const respondentToken = req.query.respondentToken;
  if (survey.settings?.preventDuplicate && respondentToken) {
    const existing = await Response.findOne({ surveyId: survey._id, respondentToken, completed: true });
    alreadySubmitted = !!existing;
  }

  res.json({
    open: true,
    alreadySubmitted,
    survey: {
      _id: survey._id,
      title: survey.title,
      description: survey.description,
      welcomeMessage: survey.welcomeMessage,
      endMessage: survey.endMessage,
      questions: survey.questions,
      settings: { allowAnonymous: survey.settings?.allowAnonymous },
    },
  });
}

export async function startResponse(req, res) {
  const survey = await Survey.findById(req.params.id);
  if (!survey) return res.status(404).json({ message: 'Survey not found' });
  if (statusMessage(survey) !== 'open') return res.status(403).json({ message: 'Survey is not open' });

  const { respondentToken } = req.body;
  if (!respondentToken) return res.status(400).json({ message: 'respondentToken is required' });

  const ipHash = hashIp(req);

  if (survey.settings?.preventDuplicate) {
    const already = await Response.findOne({ surveyId: survey._id, respondentToken, completed: true });
    if (already) return res.status(409).json({ message: 'You have already submitted a response' });
  }

  if (survey.settings?.ipRestriction?.enabled) {
    const count = await Response.countDocuments({ surveyId: survey._id, ipHash, completed: true });
    if (count >= (survey.settings.ipRestriction.maxPerIp || 1)) {
      return res.status(429).json({ message: 'Response limit reached for this network' });
    }
  }

  let response = await Response.findOne({ surveyId: survey._id, respondentToken, completed: false });
  if (!response) {
    response = await Response.create({ surveyId: survey._id, respondentToken, ipHash, startedAt: new Date() });
  }

  res.json({ responseId: response._id });
}

export async function submitResponse(req, res) {
  const survey = await Survey.findById(req.params.id);
  if (!survey) return res.status(404).json({ message: 'Survey not found' });
  if (statusMessage(survey) !== 'open') return res.status(403).json({ message: 'Survey is not open' });

  const { responseId, respondentToken, answers } = req.body;
  if (!responseId || !respondentToken || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'responseId, respondentToken and answers are required' });
  }

  const response = await Response.findOne({
    _id: responseId,
    surveyId: survey._id,
    respondentToken,
    completed: false,
  });
  if (!response) return res.status(404).json({ message: 'Response session not found or already submitted' });

  if (survey.settings?.preventDuplicate) {
    const already = await Response.findOne({ surveyId: survey._id, respondentToken, completed: true });
    if (already) return res.status(409).json({ message: 'You have already submitted a response' });
  }

  const { valid, errors } = validateAnswers(survey.questions, answers);
  if (!valid) return res.status(400).json({ message: 'Validation failed', errors });

  response.answers = answers;
  response.submittedAt = new Date();
  response.completed = true;
  await response.save();

  res.json({ message: 'success', endMessage: survey.endMessage });
}
