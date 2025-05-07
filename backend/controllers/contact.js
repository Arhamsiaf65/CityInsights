import express from 'express';
import Contact from '../models/contact.js'
import { verifyToken, requireRole } from '../services/auth.js';
import nodemailer from 'nodemailer'

const router = express.Router();

const sendMail = async (name, email, message) => {

  try {
      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: 'arhamsaif66@gmail.com',
              pass: 'tahi tebw nsnp ezhd',
          },
      });

      // Email options
      const mailOptions = {
          from: {name, email},
          to: 'arhamsaif66@gmail.com',
          subject: 'CITY INSIGHTS USER CONTACT',
          text: message,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
}

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
   sendMail(name, email, message)
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
// router.get('/', verifyToken, requireRole('admin', 'editor'), async (req, res) => {
//   try {
//     const contacts = await Contact.find();

//     if (!contacts || contacts.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No contact requests found',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: contacts,
//     });
//   } catch (error) {
//     console.error('Error fetching contact requests:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contact requests',
//       error: error.message,
//     });
//   }
// });

export default router;
