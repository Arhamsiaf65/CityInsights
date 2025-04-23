import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'editor', 'publisher'], 
    default: 'user'
  },
  requestedRole: {
    type: String,
    enum: ['editor', 'publisher'],
    default: null
  },
  avatar:     { type: String },
  bio:        { type: String },
  portfolio:  { type: String }, // 🆕 User's website or work samples
  contact:    { type: String }, // 🆕 Phone number
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt:  { type: Date, default: Date.now }
});




export default  mongoose.models.User || mongoose.model('User', UserSchema);
