import express from "express";
import User from "../models/user.js";
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { imageUpload } from "../cloudinary/uploadImage.js";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";
import { setUser, verifyToken } from "../services/auth.js";
import multer from "multer";
import PublisherApplication from "../models/publisherApplications.js";
import { otpExpiryTime, generateOTP, sendOTPEmail } from "./otp.js";
import OtpRequest from "../models/otpModel.js";


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/request-otp', upload.single('profilePic'), async (req, res) => {
  const { name, email, password, img } = req.body;
  console.log(name, email, password, img);
  

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = otpExpiryTime();
    const avatar = img ? await imageUpload(img) : null;

    await OtpRequest.findOneAndUpdate(
      { email },
      { name, password: hashedPassword, otp, otpExpires, avatar },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otp);
    res.status(200).json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP request failed" });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Missing email or OTP" });

  try {
    const request = await OtpRequest.findOne({ email });
    if (!request) return res.status(404).json({ success: false, message: "No OTP request found" });

    if (request.otp !== otp || request.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const newUser = new User({
      name: request.name,
      email: request.email,
      password: request.password,
      avatar: request.avatar
        });

    await newUser.save();
    await OtpRequest.deleteOne({ email }); // Clean up

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    const otpExpires = otpExpiryTime();

    await OtpRequest.findOneAndUpdate(
      { email },
      { name: user.name, otp, otpExpires },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send reset OTP" });
  }
});


router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const request = await OtpRequest.findOne({ email });

    if (!request || request.otp !== otp || request.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await OtpRequest.deleteOne({ email });

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
});



// router.post('/register', upload.single('profilePic'), async (req, res) => {
//     const { name, email, password, role } = req.body;
//     const file = req.file;
  
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Some necessary input field is missing"
//       });
//     }
  
//     try {
//       // Check if user already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(409).json({
//           success: false,
//           message: "User with this email already exists"
//         });
//       }
  
//       // 🔐 Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds
  
//       let profilePicUrl = null;
//       if (file) {
//         profilePicUrl = await imageUpload(file); // Upload to Cloudinary
//       }
  
//       // Save the user to DB
//       const newUser = new User({
//         name,
//         email,
//         password: hashedPassword,
//         role,
//         avatar: profilePicUrl,
//       });
  
//       await newUser.save();
  
//       res.status(201).json({
//         success: true,
//         message: "User registered successfully",
//         data: {
//           _id: newUser._id,
//           name: newUser.name,
//           email: newUser.email,
//           role: newUser.role,
//           profilePic: newUser.avatar,
//         }
//       });
//     } catch (error) {
//       console.error("Register Error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to register user",
//         error: error.message
//       });
//     }
//   });
  
  


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
const publisherUpload = upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'facePhoto', maxCount: 1 },
]);
router.patch('/apply-publisher', verifyToken, publisherUpload, async (req, res) => {
  try {
    const { requestedRole, bio, portfolio, contact } = req.body;
    const userId = req.user.id;

    if (!['publisher'].includes(requestedRole)) {
      return res.status(400).json({ message: "Invalid role request." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (['applied', 'pending', 'approved'].includes(user.verificationStatus)) {
      return res.status(400).json({ message: "Application already submitted or approved." });
    }

    

    const files = req.files;
    if (!files?.cnicFront || !files?.cnicBack || !files?.facePhoto) {
      return res.status(400).json({ message: "All 3 images are required." });
    }

    // Upload images to Cloudinary
    const [cnicFrontUrl, cnicBackUrl, facePhotoUrl] = await Promise.all([
      imageUpload(files.cnicFront[0]),
      imageUpload(files.cnicBack[0]),
      imageUpload(files.facePhoto[0]),
    ]);

    // Save application record
    const application = new PublisherApplication({
      user: userId,
      cnicFront: cnicFrontUrl,
      cnicBack: cnicBackUrl,
      facePhoto: facePhotoUrl,
    });

    await application.save();

    // Update user info
    user.requestedRole = requestedRole;
    user.bio = bio;
    user.portfolio = portfolio;
    user.contact = contact;
    user.verificationStatus = 'applied';
    await user.save();

    res.status(200).json({
      success: true,
      message: "Publisher application submitted",
      applicationId: application._id,
    });
  } catch (error) {
    console.error("Apply Publisher Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply for publisher role",
      error: error.message,
    });
  }
});

router.get('/publisher-requests', async (req, res) => {
  try {
    const applications = await PublisherApplication.find({
      status: { $in: ['applied', 'pending'] }
    }).populate('user', '-password -interests');

    res.status(200).json({
      success: true,
      total: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch publisher requests',
      error: error.message
    });
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