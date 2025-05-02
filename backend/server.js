import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './database/connectDb.js';
import postroutes from './controllers/post.js';
import userroutes from './controllers/user.js';
import adminroutes from './controllers/admin.js';
import categoryroutes from './controllers/category.js';
import commentroutes from './controllers/comment.js';
import contactroutes from './controllers/contact.js';
import addroutes from './controllers/add.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*'
}));
app.use(express.json());
connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/posts',  postroutes)
app.use('/users', userroutes)
app.use('/admin', adminroutes)
app.use('/categories', categoryroutes)
app.use('/comments', commentroutes)
app.use('/contact', contactroutes)
app.use('/add', addroutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
