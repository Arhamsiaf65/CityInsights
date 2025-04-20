// routes/post.js
import express from 'express';
import { requireRole, verifyToken } from '../services/auth.js';
import post from '../models/post.js';
import { imageUpload } from '../cloudinary/uploadImage.js';
import multer from 'multer';
const router = express.Router();

// Create post
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create', verifyToken ,requireRole('admin', 'publisher', 'editor'), upload.array('images'), async (req, res) => {
  const { title, content, category, tags } = req.body;
  try {
    // Check if there are files in the request
    const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : [];
    
    // Create a new post
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
  const posts = await post.find({}).populate('author', 'name avatar');
  res.json(posts);
});



// Update a post
router.patch('/:id', verifyToken, requireRole('admin', 'publisher', 'editor'), upload.array('images'), async (req, res) => {
    const { title, content, category, tags } = req.body;
    try {
      const postToUpdate = await post.findById(req.params.id);
      if (!postToUpdate) return res.status(404).json({ message: 'Post not found' });
  
  
      const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : postToUpdate.images;
  
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
  
  // Get a single post
  router.get('/:id', async (req, res) => {
    try {
      const singlePost = await post.findById(req.params.id).populate('author', 'name avatar');
      if (!singlePost) return res.status(404).json({ message: 'Post not found' });
      res.json(singlePost);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch post', error: error.message });
    }
  });




//   for author dashboard
  router.get('/my-posts', requireRole('author'),verifyToken, async (req, res) => {
    try {
      const posts = await post.find({ author: req.user.id }).populate('author', 'name avatar');
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
  });

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


  // POST /posts/:id/like
router.post('/:id/like', verifyToken, async (req, res) => {
    try {
      const post = await post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "post not found" });
  
      const userId = req.user.id;
      const hasLiked = post.likedBy.includes(userId);
  
      if (hasLiked) {
        post.likedBy.pull(userId);
        post.likes--;
      } else {
        post.likedBy.push(userId);
        post.likes++;
      }
  
      await post.save();
      res.json({ liked: !hasLiked, totalLikes: post.likes });
    } catch (error) {
      res.status(500).json({ message: "Error toggling like", error });
    }
  });

  
  // POST /posts/:id/share
router.post('/:id/share', async (req, res) => {
    try {
      const post = await post.findByIdAndUpdate(
        req.params.id,
        { $inc: { shares: 1 } },
        { new: true }
      );
      res.json({ shares: post.shares });
    } catch (error) {
      res.status(500).json({ message: "Error tracking share", error });
    }
  });

  




export default router