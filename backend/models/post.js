import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  content:      { type: String, required: true },
  author:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images:       [String],                                          
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags:         [String],
  featured:     { type: Boolean, default: false },
  publishedAt:  { type: Date },
  views:        { type: Number, default: 0 },
  likes:        { type: Number, default: 0 },
  likedBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares:       { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date }
});

// auto‐update `updatedAt`
postSchema.pre('save', function(next) {
  if (!this.isNew) this.updatedAt = Date.now();
  next();
});

export default  mongoose.models.Post || mongoose.model('Post', postSchema);
 