import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const planSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    input: {
      idea: { type: String, required: true, trim: true },
      budget: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
      location: { type: String, required: true, trim: true },
      category: { type: String, required: true, trim: true },
      targetCustomers: { type: String, required: true, trim: true },
    },
    analysis: { type: mongoose.Schema.Types.Mixed, required: true },
    feasibilityScore: { type: Number, min: 0, max: 100 },
    chat: [chatSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
