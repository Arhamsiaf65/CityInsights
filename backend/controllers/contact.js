import express from 'express';
import Contact from '../models/contact.js'
import { verifyToken, requireRole } from '../services/auth.js';

const router = express.Router();

// POST - Create a new contact request
router.post('/', verifyToken, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Some necessary input field is missing',
    });
  }

  try {
    // Create the new contact document
    const newContact = new Contact({
      name,
      email,
      message,
    });

    // Save the document to the database
    await newContact.save();

    return res.status(201).json({
      success: true,
      message: 'Contact request received',
      data: {
        _id: newContact._id,
        name: newContact.name,
        email: newContact.email,
        message: newContact.message,
      },
    });
  } catch (error) {
    console.error('Error creating contact request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create contact request',
      error: error.message,
    });
  }
});

// GET - Get all contact requests
router.get('/', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const contacts = await Contact.find();

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No contact requests found',
      });
    }

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact requests',
      error: error.message,
    });
  }
});

export default router;
