// routes/comment.js
import express from 'express';
import { verifyToken, requireRole } from '../services/auth.js';
import Comment from '../models/comment.js';
import Post from '../models/post.js';
import User from '../models/user.js';

const router = express.Router();

router.post('/:postId', verifyToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;
  
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });
  
      const newComment = new Comment({
        post: post._id,
        user: userId,
        content,
      });
  
      await newComment.save();
  
      // ✅ Populate the user field (only name and avatar)
      const populatedComment = await newComment.populate('user', 'name avatar');
  
      res.status(201).json({
        message: 'Comment added successfully',
        comment: populatedComment,
      });
    } catch (error) {
      console.log("error comment", error);
      res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
  });
  

// Update a comment
router.patch('/:commentId', verifyToken, async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if the user is the author of the comment or an admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update comment', error: error.message });
  }
});

// Delete a comment
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if the user is the author of the comment or an admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error: error.message });
  }
});

// Get all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment .find({ post: req.params.postId })
      .populate('user', 'name avatar')  // Optionally populate user info
      .sort({ createdAt: -1 });  // Get comments in reverse chronological order (most recent first)

    if (!comments.length) return res.status(404).json({ message: 'No comments found for this post' });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
  }
});

export default router;
