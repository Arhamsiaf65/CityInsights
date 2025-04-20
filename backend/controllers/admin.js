import express from "express";
import User from "../models/user.js";
import { requireRole, verifyToken } from "../services/auth.js";

const router = express.Router();

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
