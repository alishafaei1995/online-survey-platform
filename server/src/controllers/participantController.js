import Participant from '../models/Participant.js';

function ownerFilter(req) {
  return req.user.role === 'admin' ? {} : { createdBy: req.user.id };
}

export async function listParticipants(req, res) {
  const participants = await Participant.find(ownerFilter(req)).sort({ name: 1 });
  res.json({ participants });
}

export async function createParticipant(req, res) {
  const { name, email, department } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  const participant = await Participant.create({ name, email, department, createdBy: req.user.id });
  res.status(201).json({ participant });
}

export async function setParticipantActive(req, res) {
  const participant = await Participant.findOne({ _id: req.params.id, ...ownerFilter(req) });
  if (!participant) return res.status(404).json({ message: 'Participant not found' });

  const { active } = req.body;
  if (typeof active !== 'boolean') return res.status(400).json({ message: 'active must be a boolean' });

  participant.active = active;
  await participant.save();
  res.json({ participant });
}
