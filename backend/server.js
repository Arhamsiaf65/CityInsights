import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './database/connectDb.js';
import postroutes from './controllers/post.js';
import userroutes from './controllers/user.js';
import adminroutes from './controllers/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow multiple frontends
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://yourfrontend.com',     // Replace/add any production URL
  'https://another-frontend.com'  // Add more if needed
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ✅ Handle preflight (OPTIONS) requests
app.options("*", cors(corsOptions));

app.use(express.json());
connectDB();

// ✅ Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// ✅ API routes
app.use('/posts', postroutes);
app.use('/users', userroutes);
app.use('/admin', adminroutes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
