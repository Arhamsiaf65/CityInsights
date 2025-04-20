import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './database/connectDb.js';
import postroutes from './controllers/post.js';
import userroutes from './controllers/user.js';
import adminroutes from './controllers/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/posts',  postroutes)
app.use('/users', userroutes)
app.use('/admin', adminroutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
