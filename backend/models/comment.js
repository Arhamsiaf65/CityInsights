// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  article:   { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Comment ||  mongoose.model('Comment', CommentSchema);
