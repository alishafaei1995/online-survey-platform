import mongoose from 'mongoose';

const localizedString = { fa: { type: String, default: '' }, en: { type: String, default: '' } };

const optionSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    label: { type: localizedString, required: true },
  },
  { _id: false }
);

const scoringDimensionSchema = new mongoose.Schema(
  {
    dimension: { type: String, required: true },
    weight: { type: Number, default: 1 },
    reverse: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  type: {
    type: String,
    enum: ['single_choice', 'multiple_choice', 'likert', 'text', 'numeric', 'date', 'matrix'],
    required: true,
  },
  title: { type: localizedString, required: true },
  required: { type: Boolean, default: false },
  options: { type: [optionSchema], default: [] },
  matrixRows: { type: [optionSchema], default: [] },
  validation: {
    min: { type: Number },
    max: { type: Number },
    regex: { type: String },
    minDate: { type: Date },
    maxDate: { type: Date },
  },
  conditional: {
    dependsOn: { type: mongoose.Schema.Types.ObjectId },
    operator: { type: String, enum: ['equals', 'notEquals', 'contains'] },
    value: { type: String },
  },
  // Assessment-model linkage (optional; unused by plain surveys)
  modelItemKey: { type: String },
  scoringDimensions: { type: [scoringDimensionSchema], default: [] },
});

const surveySchema = new mongoose.Schema(
  {
    title: { type: localizedString, required: true },
    description: { type: localizedString, default: () => ({}) },
    status: { type: String, enum: ['draft', 'scheduled', 'active', 'closed'], default: 'draft' },
    schedule: {
      startAt: { type: Date },
      endAt: { type: Date },
    },
    welcomeMessage: { type: localizedString, default: () => ({}) },
    endMessage: { type: localizedString, default: () => ({}) },
    questions: { type: [questionSchema], default: [] },
    settings: {
      allowAnonymous: { type: Boolean, default: true },
      preventDuplicate: { type: Boolean, default: true },
      ipRestriction: {
        enabled: { type: Boolean, default: false },
        maxPerIp: { type: Number, default: 1 },
      },
      targetCount: { type: Number },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Assessment-model linkage (optional; unused by plain surveys)
    modelKey: { type: String },
    modelVersion: { type: Number },
  },
  { timestamps: true }
);

surveySchema.methods.isCurrentlyOpen = function () {
  if (this.status === 'closed') return false;
  if (this.status === 'draft') return false;
  const now = new Date();
  if (this.schedule?.startAt && now < this.schedule.startAt) return false;
  if (this.schedule?.endAt && now > this.schedule.endAt) return false;
  return true;
};

export default mongoose.model('Survey', surveySchema);
