import express from 'express';
import { verifyToken } from '../services/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

const sendMail = async (name, email, message, res) => {
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
      from: `"${name}" <${email}>`,  // Correct format for "from"
      to: 'arhamsaif66@gmail.com',
      subject: 'CITY INSIGHTS USER CONTACT',
      text: message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
};

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
    // Send the email
    await sendMail(name, email, message, res);  // Pass res to sendMail function
  } catch (error) {
    console.error('Error creating contact request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create contact request',
      error: error.message,
    });
  }
});

export default router;
