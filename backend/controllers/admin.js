import express from "express";
import User from "../models/user.js";
import { requireRole, verifyToken } from "../services/auth.js";
import { imageUpload } from "../cloudinary/uploadImage.js";
import multer from "multer";

const router = express.Router();

// create user
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post('/create-user', upload.single('profilePic'), requireRole('admin'), verifyToken, async (req, res) => {
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


// get all users
router.get('/all-users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({role: 'user'}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
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



// PATCH /api/users/:id/role
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


export default router;
