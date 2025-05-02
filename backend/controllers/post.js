// routes/post.js
import express from 'express';
import { requireRole, verifyToken } from '../services/auth.js';
import post from '../models/post.js';
import Category from '../models/category.js';
import { imageUpload } from '../cloudinary/uploadImage.js';
import multer from 'multer';
import mongoose from 'mongoose';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create post
router.post('/create', verifyToken, requireRole('admin', 'publisher', 'editor'), upload.array('images'), async (req, res) => {
  const { title, content, category, tags } = req.body;
  try {
    const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : [];

    // Optional: Validate category ID
    if (category && (!mongoose.Types.ObjectId.isValid(category) || !(await Category.findById(category)))) {
      return res.status(400).json({ message: 'Invalid or non-existent category' });
    }

    const newPost = new post({
      title,
      content,
      author: req.user.id,
      category,
      tags,
      images,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post posted successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
});

// Get All posts
router.get('/', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await post.find({})
      .sort({ createdAt: -1 }) // Newest posts first
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar')
      .populate('category', 'name');

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update a post
router.patch('/:id', verifyToken, requireRole('admin', 'publisher', 'editor'), upload.array('images'), async (req, res) => {
  const { title, content, category, tags } = req.body;
  try {
    const postToUpdate = await post.findById(req.params.id);
    if (!postToUpdate) return res.status(404).json({ message: 'Post not found' });

    const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : postToUpdate.images;

    if (category && (!mongoose.Types.ObjectId.isValid(category) || !(await Category.findById(category)))) {
      return res.status(400).json({ message: 'Invalid or non-existent category' });
    }

    postToUpdate.title = title || postToUpdate.title;
    postToUpdate.content = content || postToUpdate.content;
    postToUpdate.category = category || postToUpdate.category;
    postToUpdate.tags = tags || postToUpdate.tags;
    postToUpdate.images = images;
    postToUpdate.updatedAt = new Date();

    await postToUpdate.save();
    res.json({ message: 'Post updated successfully', post: postToUpdate });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
});

// Delete a post
router.delete('/:id', verifyToken, requireRole('admin', 'publisher', 'editor'), async (req, res) => {
  try {
    const postToDelete = await post.findById(req.params.id);
    if (!postToDelete) return res.status(404).json({ message: 'Post not found' });

    if (req.user.id !== postToDelete.author.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
});

// routes/post.js
// Add the following search route:

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query; // Get search query from the query parameters
    if (!q) {
      return res.status(400).json({ message: "Search term is required" });
    }

    // Build a regex for case-insensitive search
    const searchQuery = new RegExp(q, 'i'); // 'i' makes the search case-insensitive

    // Search posts by title, content, or tags
    const posts = await post.find({
      $or: [
        { title: { $regex: searchQuery } },
        { content: { $regex: searchQuery } },
        { tags: { $regex: searchQuery } },
      ],
    })
      .populate('author', 'name avatar')
      .populate('category', 'name');

    res.json(posts);
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "Failed to search posts", error: error.message });
  }
});


// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const singlePost = await post.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('category', 'name');
    if (!singlePost) return res.status(404).json({ message: 'Post not found' });
    res.json(singlePost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
});

// Author dashboard - get own posts
router.get('/my-posts', verifyToken, requireRole('author'), async (req, res) => {
  try {
    const posts = await post.find({ author: req.user.id })
      .populate('author', 'name avatar')
      .populate('category', 'name');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
});

// Increment views
router.post('/:id/view', async (req, res) => {
  try {
    const post = await post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: post.views });
  } catch (error) {
    res.status(500).json({ message: "Error incrementing view", error });
  }
});

// Like or unlike a post
router.post('/:id/like', verifyToken,async (req, res) => {
  try {
    const postDoc = await post.findById(req.params.id);
    if (!postDoc) return res.status(404).json({ message: "post not found" });

    const { userId } = req.body;
    console.log("userId", userId);

    // 🛠 Correct way
    const hasLiked = postDoc.likedBy.includes(userId);
    console.log("has liked", hasLiked);

    if (hasLiked) {
      postDoc.likedBy.pull(userId);
      postDoc.likes--;
      console.log("Disliked");
    } else {
      postDoc.likedBy.push(userId);
      postDoc.likes++;
      console.log("Liked");
    }

    await postDoc.save();
    res.json({ liked: !hasLiked, totalLikes: postDoc.likes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error toggling like", error });
  }
});


// Share a post
router.post('/:id/share' , async (req, res) => {
  try {
    const Post = await post.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    
    res.json({ shares: Post.shares });
  } catch (error) {
    res.status(500).json({ message: "Error tracking share", error });
  }
});

export default router;
