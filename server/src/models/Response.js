import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
    respondentToken: { type: String, required: true },
    ipHash: { type: String, required: true },
    answers: { type: [answerSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    completed: { type: Boolean, default: false },
    // Assessment-model participant linkage (optional; unused by plain anonymous surveys)
    subjectParticipantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    raterParticipantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
    raterRelationship: { type: String, enum: ['self', 'manager', 'peer', 'subordinate', 'external'] },
  },
  { timestamps: true }
);

responseSchema.index({ surveyId: 1, respondentToken: 1 });
responseSchema.index({ surveyId: 1, ipHash: 1 });

export default mongoose.model('Response', responseSchema);
