import express from "express";
import User from "../models/user.js";
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { imageUpload } from "../cloudinary/uploadImage.js";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import { setUser, verifyToken } from "../services/auth.js";
import multer from "multer";


const router = express.Router();






const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post('/register', upload.single('profilePic'), async (req, res) => {
    const { name, email, password } = req.body;
    const file = req.file;
  
    if (!name || !email || !password) {
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
        message: "User registered successfully",
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          profilePic: newUser.avatar,
        }
      });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register user",
        error: error.message
      });
    }
  });
  
  


  router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email or password is missing" });
        }

        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = setUser(user); // Generate token using the `setUser` function

        res.status(200).json({
            message: "Login successful",
            token, // Send the token to the client
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

router.post('/logout', (req, res) => {
  // If using cookies to store the token:
  res.clearCookie('adminToken' || 'token');

  res.status(200).json({
      success: true,
      message: "Logged out successfully"
  });
});



router.get('/profile', verifyToken, async (req, res) => {
    try {
        console.log(req.user);
        const user = await User.findById(req.user.id); // Retrieve the user from the decoded token

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve user profile", error: error.message });
    }
});




export default router;