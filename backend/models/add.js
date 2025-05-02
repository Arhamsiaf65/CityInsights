// models/Ad.js
import mongoose from "mongoose";
const AdSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  title:        { type: String, required: true },
  description:  { type: String },
  images:       [String],     
  link: {type: String},    
    address:     { type: String },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { 
                  type: String, 
                  enum: ['pending','approved','rejected'], 
                  default: 'pending' 
                },
  createdAt:    { type: Date, default: Date.now }
});

export default mongoose.model.Ad || mongoose.model('Ad', AdSchema);
