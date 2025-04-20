import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://arham:arhamsaif@cluster0.q6hne.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};