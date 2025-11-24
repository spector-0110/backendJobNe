// src/config/db.js
import mongoose from "mongoose";

/**
 * DB CONNECTOR
 * - Single responsibility: connect to MongoDB
 * - Returns mongoose connection promise
 * - Keeps options tuned for production
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set in .env");

  console.log(`Attempting to connect to MongoDB`);
  
  // Set a connection timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('MongoDB connection timeout after 10 seconds')), 10000);
  });

  try {
    await Promise.race([
      mongoose.connect(uri),
      timeoutPromise
    ]);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};