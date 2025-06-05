import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  embedUrl: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isLive: { type: Boolean, default: false },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.LiveStream || mongoose.model('LiveStream', liveStreamSchema);
