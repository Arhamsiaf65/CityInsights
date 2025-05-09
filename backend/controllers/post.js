// routes/post.js
import express from 'express';
import { requireRole, verifyToken , optionalAuth} from '../services/auth.js';
import post from '../models/post.js';
import User from '../models/user.js';
import Category from '../models/category.js';
import { imageUpload } from '../cloudinary/uploadImage.js';
import multer from 'multer';
import mongoose from 'mongoose';
import { updateUserInterests } from './functions.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/fetch', optionalAuth, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    let allPosts = [];

    // STEP 1: Get popular post IDs to exclude
    const popularPosts = await post.find({})
      .sort({ likes: -1, views: -1, shares: -1 })
      .limit(10)
      .select('_id'); // Only fetch IDs

    const popularPostIds = popularPosts.map(p => p._id.toString());

    if (req.user && req.user.interests) {
      const { interests } = req.user;

      const preferenceQuery = {
        $or: [
          { category: { $in: interests.categories } },
          { tags: { $in: interests.tags } },
          { author: { $in: interests.authors } }
        ],
        _id: { $nin: popularPostIds } // Exclude popular posts
      };

      const preferredPosts = await post.find(preferenceQuery);

      const preferredPostIds = preferredPosts.map(p => p._id.toString());

      const otherPosts = await post.find({
        _id: { $nin: [...preferredPostIds, ...popularPostIds] }
      })
        .sort({ createdAt: -1 })
        .populate('author', 'name avatar')
        .populate('category', 'name');

      allPosts = [...preferredPosts, ...otherPosts];
    } else {
      allPosts = await post.find({ _id: { $nin: popularPostIds } }) // Exclude popular
        .sort({ createdAt: -1 })
        .populate('author', 'name avatar')
        .populate('category', 'name');
    }

    const paginatedPosts = allPosts.slice(skip, skip + limit);
    res.json(paginatedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






// Get popular posts
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularPosts = await post.find({})
      .sort({ likes: -1, views: -1, shares: -1 }) 
      .limit(limit)
      .populate('author', 'name avatar')
      .populate('category', 'name');

    res.json(popularPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch popular posts', error: error.message });
  }
});


router.post('/create', verifyToken, requireRole(['admin', 'publisher', 'editor'])
  , upload.array('images'), async (req, res) => {
    const { title, content, category, tags, featured } = req.body;
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
        featured,
      });

      await newPost.save();
      res.status(201).json({ message: 'Post posted successfully', post: newPost });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create post', error: error.message });
    }
  });



router.get('/', async (req, res) => {
  try {
    const { title, author, category, featured, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (author) {
      const authorDoc = await User.findOne({ name: { $regex: author, $options: 'i' } });
      if (authorDoc) {
        filter.author = authorDoc._id;
      } else {
        return res.status(200).json({ posts: [], totalPages: 0, currentPage: 1, success: true });
      }
    }

    if (category) {
      const categoryDoc = await Category.findOne({ name: { $regex: category, $options: 'i' } });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.status(200).json({ posts: [], totalPages: 0, currentPage: 1, success: true });
      }
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const skip = (page - 1) * limit;
    const totalPosts = await post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await post.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts,
      totalPages,
      currentPage: parseInt(page),
      success: true,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});



// Update a post
router.patch('/:id', verifyToken, requireRole(['admin', 'publisher', 'editor']), upload.array('images'), async (req, res) => {
  const { title, content, category, tags, featured } = req.body;

  // post lookup
  const postToUpdate = await post.findById(req.params.id);
  if (!postToUpdate) return res.status(404).json({ message: 'Post not found' });

  // handle images
  const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : postToUpdate.images;

  // validate category
  if (category && (!mongoose.Types.ObjectId.isValid(category) || !(await Category.findById(category)))) {
    return res.status(400).json({ message: 'Invalid or non-existent category' });
  }

  // assign updates
  postToUpdate.title = title || postToUpdate.title;
  postToUpdate.content = content || postToUpdate.content;
  postToUpdate.category = category || postToUpdate.category;
  postToUpdate.tags = tags || postToUpdate.tags;
  postToUpdate.featured = featured || postToUpdate.featured;
  postToUpdate.images = images;
  postToUpdate.updatedAt = new Date();

  await postToUpdate.save();
  res.json({ message: 'Post updated successfully', post: postToUpdate });
});


// Delete a post
router.delete('/:id', verifyToken, requireRole(['admin', 'publisher', 'editor']), async (req, res) => {
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
    const Post = await post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: Post.views });
  } catch (error) {
    console.error('Error:', error);  // Log the error to the console
    res.status(500).json({ message: "Error incrementing view", error: error.message });
  }
});


// Like or unlike a post
router.post('/:id/like', verifyToken,async (req, res) => {
  try {
    const postDoc = await post.findById(req.params.id);
    if (!postDoc) return res.status(404).json({ message: "post not found" });

    const { userId } = req.body;

    // 🛠 Correct way
    const hasLiked = postDoc.likedBy.includes(userId);

    if (hasLiked) {
      postDoc.likedBy.pull(userId);
      postDoc.likes--;
    } else {
      postDoc.likedBy.push(userId);
      postDoc.likes++;
    await updateUserInterests(req.user.id, req.params.id);
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
