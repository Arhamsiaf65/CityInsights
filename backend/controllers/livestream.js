import express from 'express';
import { verifyToken, requireRole } from '../services/auth.js';
import livestream from '../models/livestream.js';
// === ROUTER ===
const router = express.Router();

// Function to generate YouTube embed HTML
// Utility function to generate YouTube embed HTML
function generateEmbedHtml(streamUrl) {
    const match = streamUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([^\s&?]+)/
    );
    const videoId = match ? match[1] : null;
  
    if (!videoId) return null;  
  
    return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  }
  
  
  // Route to create a live stream
 // Stream Creation Endpoint
router.post('/create',  async (req, res) => {
    try {
      const {
        title,
        description,
        streamUrl,
        embedUrl,
        scheduleFrom,
        scheduleTo,
        isLive = false // optional, default false
      } = req.body;
  
      // Ensure title and schedule dates are present
      if (!title || !scheduleFrom || !scheduleTo) {
        return res.status(400).json({ message: 'Title, scheduleFrom, and scheduleTo are required.' });
      }
  
      // Generate or validate embed HTML
      const finalEmbedHtml = embedUrl || generateEmbedHtml(streamUrl);
      if (!finalEmbedHtml) {
        return res.status(400).json({ message: 'Valid YouTube streamUrl or embedUrl is required.' });
      }
  
      // Create the new livestream document
      const newStream = new livestream({
        title,
        description,
        embedUrl: finalEmbedHtml,
        streamUrl,
        isLive,
        startTime: scheduleFrom,  // <- correct mapping
        endTime: scheduleTo,
      });
      
  
      await newStream.save();
  
      return res.status(201).json({ message: 'Livestream created successfully', stream: newStream });
    } catch (error) {
      console.error('Stream creation error:', error.message);
      return res.status(500).json({ message: 'Failed to create stream', error: error.message });
    }
  });
  
  
  

  router.get('/', async(req, res) => {
    try {
        res.json('working correct')
    } catch (error) {
        res.json('error')
    }
  })
  

// ✅ Get All Streams
// ✅ Get All Streams with cleanup and live update
router.get('/get-all', async (req, res) => {
    try {
      const now = new Date();
  
      // 1. Delete expired streams
      await livestream.deleteMany({ endTime: { $lt: now } });
  
      // 2. Mark currently live streams
      await livestream.updateMany(
        { startTime: { $lte: now }, endTime: { $gte: now } },
        { $set: { isLive: true } }
      );
  
      // 3. Mark others as not live
      await livestream.updateMany(
        {
          $or: [
            { startTime: { $gt: now } },
            { endTime: { $lt: now } }
          ]
        },
        { $set: { isLive: false } }
      );
  
      // 4. Fetch updated streams
      const streams = await livestream.find().sort({ startTime: -1 });
  
      res.json(streams);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch streams', error: error.message });
    }
  });
  
  

// ✅ Get Single Stream
router.get('/:id', async (req, res) => {
  try {
    const stream = await livestream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });

    res.json(stream);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stream', error: error.message });
  }
});

// ✅ Update Stream
router.patch('/:id', verifyToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const stream = await livestream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });

    if (req.user.id !== stream.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this stream' });
    }

    const { title, description, platform, streamUrl, startTime, endTime, isLive } = req.body;

    if (startTime) stream.startTime = startTime;
    if (endTime) stream.endTime = endTime;
    if (title) stream.title = title;
    if (description) stream.description = description;
    if (platform) stream.platform = platform;
    if (streamUrl) stream.streamUrl = streamUrl;
    if (scheduledTime) stream.scheduledTime = scheduledTime;
    if (typeof isLive === 'boolean') stream.isLive = isLive;

    await stream.save();
    res.json({ message: 'Stream updated successfully', stream });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stream', error: error.message });
  }
});


router.get('/live-now', async (req, res) => {
    try {
      const now = new Date();
      const liveStreams = await livestream.find({
        startTime: { $lte: now },
        endTime: { $gte: now },
        isLive: true
      });
  
      res.json(liveStreams);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get live streams', error: error.message });
    }
  });

  
// ✅ Delete Stream
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const stream = await livestream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: 'Stream not found' });

    await stream.deleteOne();
    res.json({ message: 'Stream deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete stream', error: error.message });
  }
});

// ✅ Set Live Status (admin only)
router.post('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { isLive } = req.body;

    const stream = await livestream.findByIdAndUpdate(req.params.id, { isLive }, { new: true });
    if (!stream) return res.status(404).json({ message: 'Stream not found' });

    res.json({ message: `Stream marked as ${isLive ? 'Live' : 'Offline'}`, stream });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stream status', error: error.message });
  }
});

export default router;
