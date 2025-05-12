import mongoose from "mongoose";

const publisherApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One application per user
  },
  cnicFront: {
    type: String,
    required: true, // URL or local path to image
  },
  cnicBack: {
    type: String,
    required: true,
  },
  facePhoto: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNote: {
    type: String,
    default: "",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
});

export default mongoose.models.PublisherApplication ||
  mongoose.model("PublisherApplication", publisherApplicationSchema);
