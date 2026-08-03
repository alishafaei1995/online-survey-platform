import mongoose from 'mongoose';
import { listModels, getModelDefinition } from '../config/assessmentModels/index.js';

function serializeModel(model) {
  return {
    key: model.key,
    version: model.version,
    name: model.name,
    description: model.description,
    identitySource: model.identitySource,
    granularity: model.granularity,
    dimensions: model.dimensions,
    chart: model.chart,
    itemCount: model.items.length,
  };
}

export async function listAssessmentModels(req, res) {
  res.json({ models: listModels().map(serializeModel) });
}

export async function getAssessmentModel(req, res) {
  const model = getModelDefinition(req.params.key);
  if (!model) return res.status(404).json({ message: 'Model not found' });
  res.json({ model: serializeModel(model) });
}

export async function instantiateAssessmentModel(req, res) {
  const model = getModelDefinition(req.params.key);
  if (!model) return res.status(404).json({ message: 'Model not found' });

  const questions = model.buildQuestions().map((q) => ({ ...q, _id: new mongoose.Types.ObjectId().toString() }));

  res.json({
    survey: {
      title: model.name,
      description: model.description,
      welcomeMessage: { fa: '', en: '' },
      endMessage: { fa: '', en: '' },
      status: 'draft',
      schedule: { startAt: '', endAt: '' },
      questions,
      settings: {
        allowAnonymous: model.identitySource === 'anonymous',
        preventDuplicate: true,
        ipRestriction: { enabled: false, maxPerIp: 1 },
        targetCount: undefined,
      },
      modelKey: model.key,
      modelVersion: model.version,
    },
  });
}
