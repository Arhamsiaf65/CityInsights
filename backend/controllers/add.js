import express from 'express';
import { verifyToken, requireRole } from '../services/auth.js';
import multer from 'multer';
import Ad from '../models/add.js'
import { imageUpload } from '../cloudinary/uploadImage.js';
import mongoose from 'mongoose';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Create Ad
router.post('/create', verifyToken, requireRole('admin', 'editor')  ,upload.array('images'), async (req, res) => {
  try {
    const { businessName, title,link, description, address } = req.body;
    const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : [];

    const newAd = new Ad({
      businessName,
      title,
      description,
      address,
      images,
      link,
      createdBy: req.user.id,
    });

    await newAd.save();
    res.status(201).json({ message: 'Ad created successfully', ad: newAd });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ad', error: error.message });
  }
});

// get one random
router.get('/', async (req, res) => {
    try {
     
  
      // Step 2: Get a random ad using $sample
      const randomAd = await Ad.aggregate([
        { $sample: { size: 1 } }
      ]);
  
      // Step 3: Populate createdBy field (manual after aggregation)
      const populated = await Ad.populate(randomAd, {
        path: 'createdBy',
        select: 'name email'
      });
  
      // Step 4: Return the random ad or null
      if (populated.length > 0) {
        res.json(populated[0]); // Still only one result, random each time
      } else {
        res.status(404).json({ message: 'No ad found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch random ad', error: error.message });
    }
  });
  


// /get all addds
router.get('/get-all', async (req, res) => {
  try {
    const { status, skip = 0, limit = 10 } = req.query;
    const filter = status ? { status } : {};

    const ads = await Ad.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ads', error: error.message });
  }
});

// ✅ Get Single Ad
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('createdBy', 'name email');
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ad', error: error.message });
  }
});

// ✅ Update Ad
router.patch('/:id', verifyToken, requireRole('businessOwner', 'admin'), upload.array('images'), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    if (req.user.id !== ad.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this ad' });
    }

    const {
      businessName, title, description, address,
      startDate, endDate, status
    } = req.body;

    const images = req.files?.length ? await Promise.all(req.files.map(file => imageUpload(file))) : ad.images;

    ad.businessName = businessName || ad.businessName;
    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.address = address || ad.address;
    ad.images = images;
    ad.status = status || ad.status;

    await ad.save();
    res.json({ message: 'Ad updated successfully', ad });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ad', error: error.message });
  }
});

// ✅ Delete Ad
router.delete('/:id', verifyToken, requireRole('businessOwner', 'admin'), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    if (req.user.id !== ad.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this ad' });
    }

    await ad.deleteOne();
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ad', error: error.message });
  }
});

// ✅ Approve or Reject Ad (admin only)
router.post('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ad = await Ad.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    res.json({ message: `Ad ${status}`, ad });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

export default router;
