import express from "express";
import User from "../models/user.js";
import { requireRole, verifyToken } from "../services/auth.js";
import Category from "../models/category.js";
import Post from '../models/post.js'

const router = express.Router();

router.post('/add-category', verifyToken, requireRole('admin'), async (req, res) => {
  const { name, description } = req.body;

  try {
    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    res.status(500).json({ message: "Failed to create category", error: error.message });
  }
});

router.put('/update-category/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category name is changed and exists already
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) return res.status(409).json({ message: "Category name already exists" });
    }

    // Update category fields
    category.name = name || category.name;
    category.description = description || category.description;

    await category.save();

    res.status(200).json({ success: true, message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Failed to update category", error: error.message });
  }
});



router.delete('/delete-category/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    // Find and delete the category
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Optionally, update the posts that referenced this category
    const updatedPosts = await Post.updateMany({ category: req.params.id }, { $unset: { category: "" } });

    if (updatedPosts.modifiedCount === 0) {
      console.log("No posts were updated.");
    }
 
    // Send success message after everything is done
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
});



router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
});






export default router;