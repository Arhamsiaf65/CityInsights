import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import 'dotenv/config.js';



// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Don't forget to include this
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file should be a buffer (like req.file.buffer from multer with memoryStorage)
export const imageUpload = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); 
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

// export const imageArrayUpload = (file) => {
//     return new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result.secure_url);  // Return Cloudinary URL after successful upload
//         }
//       );
      
//       streamifier.createReadStream(file.buffer).pipe(stream);  // Upload image from buffer
//     });
//   };
