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
import chatroutes from './controllers/chatboat.js';
import livestreamroutes from './controllers/livestream.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'https://city-insight-sigma.vercel.app',
        'https://city-insights-nine.vercel.app',
        'https://news-97zh.vercel.app/',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
app.use('/chat', chatroutes)
app.use('/livestream', livestreamroutes)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
