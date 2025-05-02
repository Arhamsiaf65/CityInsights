import express from "express";
import Category from "../models/category.js";
import { requireRole, verifyToken } from "../services/auth.js";

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

  

  router.delete('/delete-category/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const deleted = await Category.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Category not found" });
  
      // Optionally remove the category from all posts
      await Post.updateMany({ category: req.params.id }, { $unset: { category: "" } });
  
      res.json({ success: true, message: "Category deleted" });
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
  

  router.put('/update-category/:id', verifyToken, requireRole('admin'), async (req, res) => {
    const { name, description } = req.body;
  
    try {
      // Check if the category exists
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      // Optional: check if the new name already exists in another category
      if (name && name !== category.name) {
        const existing = await Category.findOne({ name });
        if (existing) {
          return res.status(409).json({ message: "Category with this name already exists" });
        }
      }
  
      // Update fields
      category.name = name || category.name;
      category.description = description || category.description;
  
      await category.save();
  
      res.status(200).json({ success: true, message: "Category updated", category });
    } catch (error) {
      res.status(500).json({ message: "Failed to update category", error: error.message });
    }
  });
  


  


export default router;