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

// Enable CORS with specific origin
const corsOptions = {
    origin: '*', // Allow all origins (not recommended for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
});

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
