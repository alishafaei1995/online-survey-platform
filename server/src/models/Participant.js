import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    department: { type: String },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Participant', participantSchema);
