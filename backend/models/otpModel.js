import mongoose from "mongoose";

const otpRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String, // This should be the hashed password
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "publisher"], // or whatever roles you allow
    default: "user",
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
  },
  avatar: {
    type: String, // This will store the Cloudinary image URL
    default: null,
  },
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

export default mongoose.models.OtpRequest || mongoose.model("OtpRequest", otpRequestSchema);
