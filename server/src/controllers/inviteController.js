import { randomUUID } from 'crypto';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Participant from '../models/Participant.js';

function ownerFilter(req) {
  return req.user.role === 'admin' ? {} : { createdBy: req.user.id };
}

function buildLink(surveyId, respondentToken) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientUrl}/s/${surveyId}?respondentToken=${respondentToken}`;
}

export async function createInvite(req, res) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const { subjectParticipantId, raterParticipantId, raterRelationship } = req.body;
  if (!subjectParticipantId) return res.status(400).json({ message: 'subjectParticipantId is required' });

  const subject = await Participant.findOne({ _id: subjectParticipantId, ...ownerFilter(req) });
  if (!subject) return res.status(404).json({ message: 'Subject participant not found' });

  if (raterParticipantId) {
    const rater = await Participant.findOne({ _id: raterParticipantId, ...ownerFilter(req) });
    if (!rater) return res.status(404).json({ message: 'Rater participant not found' });
  }

  const respondentToken = randomUUID();
  const response = await Response.create({
    surveyId: survey._id,
    respondentToken,
    ipHash: 'invite-pending',
    subjectParticipantId,
    raterParticipantId: raterParticipantId || undefined,
    raterRelationship: raterRelationship || undefined,
  });

  res.status(201).json({ responseId: response._id, link: buildLink(survey._id, respondentToken) });
}

export async function listInvites(req, res) {
  const survey = await Survey.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!survey) return res.status(404).json({ message: 'Survey not found' });

  const responses = await Response.find({ surveyId: survey._id, subjectParticipantId: { $exists: true } })
    .populate('subjectParticipantId', 'name')
    .populate('raterParticipantId', 'name')
    .sort({ createdAt: -1 });

  const invites = responses.map((r) => ({
    responseId: r._id,
    subjectName: r.subjectParticipantId?.name,
    raterName: r.raterParticipantId?.name,
    raterRelationship: r.raterRelationship,
    completed: r.completed,
    link: buildLink(survey._id, r.respondentToken),
  }));
  res.json({ invites });
}
