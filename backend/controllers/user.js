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
    const { name, email, password, role } = req.body;
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
  res.clearCookie('token ');

  res.status(200).json({
      success: true,
      message: "Logged out successfully"
  });
});





router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Retrieve the user from the decoded token
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
           user
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve user profile", error: error.message });
    }
});

router.put('/profile/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // User ID from the token
    const { name, email, password, profilePic, bio, portfolio, contact } = req.body; // Fields to update

    const updatedData = {};

    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) {
      // Hash the password if it's provided
      const hashedPassword = await bcrypt.hash(password, 12);
      updatedData.password = hashedPassword;
    }
    if (profilePic) updatedData.profilePic = profilePic; // Assuming profilePic is URL
    if (bio) updatedData.bio = bio;
    if (portfolio) updatedData.portfolio = portfolio;
    if (contact) updatedData.contact = contact;

    // Find user by ID and update the fields
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updatedData },
      { new: true, runValidators: true } // Return the updated user
    );

    // If user is not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send updated user in response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
});



// apply for publisher role
// PATCH /users/apply-publisher
router.patch('/apply-publisher', verifyToken, async (req, res) => {
  const { requestedRole, bio, portfolio, contact } = req.body;

  try {
    // Check if the user has already applied
    const user = await User.findById(req.user.id);
    
    if (['applied', 'pending', 'approved'].includes(user.verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "You have already applied or your application is under review."
      });
    }
    

    // Update the user's role and status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        requestedRole,
        bio,
        portfolio,
        contact,
        verificationStatus: 'applied'  // Set status to 'applied'
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Role application submitted with verification details",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        requestedRole: updatedUser.requestedRole,
        bio: updatedUser.bio,
        portfolio: updatedUser.portfolio,
        contact: updatedUser.contact,
        verificationStatus: updatedUser.verificationStatus  // Send updated status
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply for role", error: error.message });
  }
});

router.get('/publisher-requests', verifyToken, async (req, res) => {
  try {
    const publishers = await User.find({ requestedRole: 'publisher' });

    res.status(200).json({
      success: true,
      total: publishers.length,
      users: publishers
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch publisher requests', error: error.message });
  }
});



router.patch('/update-request/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  try {
    const validStatuses = ['accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use accepted or rejected.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        verificationStatus: status,
        role: status === 'accepted' ? 'publisher' : 'user',
        requestedRole: null
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User has been ${status}`,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update verification status', error: error.message });
  }
});







export default router;