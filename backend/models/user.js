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
    enum: ['normal','applied','pending', 'approved', 'rejected'],
    default: 'normal'
  },
  interests: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    tags: [String],
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },  
  createdAt:  { type: Date, default: Date.now }
});




export default  mongoose.models.User || mongoose.model('User', UserSchema);
