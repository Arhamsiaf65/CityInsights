// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  establishmentName:    { type: String, required: true },
  establishmentType:    { 
                          type: String, 
                          enum: ['school','college','restaurant','other'], 
                          default: 'other' 
                        },
  rating:               { type: Number, min: 1, max: 5, required: true },
  comment:              { type: String },
  status:               { 
                          type: String, 
                          enum: ['pending','approved','rejected'], 
                          default: 'pending' 
                        },
  createdAt:            { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
