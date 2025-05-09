import express from "express";
import User from "../models/user.js";
import { requireRole, verifyToken } from "../services/auth.js";
import { imageUpload } from "../cloudinary/uploadImage.js";
import multer from "multer";
import bcrypt from 'bcryptjs';
import Post from '../models/post.js'
import mongoose from "mongoose";

const router = express.Router();

router.post('/logout', (req, res) => {
  res.clearCookie('adminToken', { path: '/' });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});




// create user
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post('/create-user', upload.single('profilePic'), verifyToken, requireRole('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  const file = req.file;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Some necessary input field is missing"
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // 🔐 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    let profilePicUrl = null;
    if (file) {
      profilePicUrl = await imageUpload(file); // Upload to Cloudinary
    }

    // Save the user to DB
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: profilePicUrl,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.avatar,
      }
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message
    });
  }
});


// get all other roles than user
router.get('/management-roles', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['admin', 'publisher', 'editor'] }
    }).select('-password');

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});




// get all users
router.get('/all-users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});


// search users
router.get('/search-users', verifyToken, requireRole('admin'), async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }

  try {
    const users = await User.find({
      role: 'user',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('-password');

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to search users", error: error.message });
  }
});



// delete user
router.delete('/delete-user/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(403).json({ message: "You cannot delete yourself." });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
});



// change role of user base on their id
// PATCH /admin/change-role/:the user id to update/
router.patch('/change-role/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { role } = req.body;

  try {
    // Prevent admin from changing their own role
    if (req.user.id === req.params.id) {
      return res.status(403).json({ message: "You cannot change your own role." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
});

// to update users profile
// PATCH /admin/update/:userid
router.patch('/update/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, email, password } = req.body;

  try {


    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
});


// the publisher applicants
// GET /admin/publisher-applicants
router.get('/publisher-applicants', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const applicants = await User.find({ requestedPublisher: true }).select('-password');

    res.status(200).json({
      success: true,
      applicants
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applicants", error: error.message });
  }
});


router.get('/dashboard', verifyToken, requireRole('admin'), async (req, res) => {

  const getStartOfDay = () => new Date(new Date().setHours(0, 0, 0, 0));  // Today
  const getStartOfMonth = () => new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);  // First day of the month
  const getStartOfYear = () => new Date(new Date().setMonth(0, 1)).setHours(0, 0, 0, 0);  // First day of the year


  try {
    // Get counts for Total Users
    const totalUsers = await User.countDocuments();

    // Get counts for Total Posts in the month, year, and today
    const totalPostsThisMonth = await Post.countDocuments({
      createdAt: { $gte: getStartOfMonth() }
    });

    const totalPostsThisYear = await Post.countDocuments({
      createdAt: { $gte: getStartOfYear() }
    });

    const totalPostsToday = await Post.countDocuments({
      createdAt: { $gte: getStartOfDay() }
    });

    // Get counts for Total Users Today
    const totalUsersToday = await User.countDocuments({
      createdAt: { $gte: getStartOfDay() }
    });

    // Get recent 5 posts
    const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name role');;

    // Monthly data for the graph (likes and views)
    const monthlyLikes = Array(12).fill(0);
    const monthlyViews = Array(12).fill(0);

    // Aggregate likes and views grouped by month
    const postsByMonth = await Post.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          totalLikes: { $sum: '$likes' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);


    postsByMonth.forEach((item) => {
      const monthIndex = item._id.month - 1;
      monthlyLikes[monthIndex] = item.totalLikes;
      monthlyViews[monthIndex] = item.totalViews;
    });


    // Return the dashboard data
    res.json({
      totalUsers,
      totalPostsThisMonth,
      totalPostsThisYear,
      totalPostsToday,
      totalUsersToday,
      recentPosts,
      graphData: [
        { name: 'likes', data: monthlyLikes },
        { name: 'views', data: monthlyViews }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
 


export default router;
