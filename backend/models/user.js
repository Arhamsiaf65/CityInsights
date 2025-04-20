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
  avatar:     { type: String },
  bio:        { type: String },
  createdAt:  { type: Date, default: Date.now }
});


export default  mongoose.models.User || mongoose.model('User', UserSchema);
