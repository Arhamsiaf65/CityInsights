// utils/otp.js
import nodemailer from 'nodemailer';


export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const otpExpiryTime = () => Date.now() + 5 * 60 * 1000; // 5 minutes from now


// utils/mailer.js

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'arhamsaif66@gmail.com',
        pass: 'kpcs awdo vgyy yalr',
      },
    });

    const mailOptions = {
      from: 'arhamsaif66@gmail.com',
      to: email,
      subject: 'Your OTP for CityInsight Verification',
      text: `Hello,\n\nYour OTP code is: ${otp}\nIt will expire in 5 minutes.\n\nThank you,\nCityInsight Team`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP email sent successfully.' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, message: 'Failed to send OTP email.' };
  }
};
