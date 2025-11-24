// src/config/gridfs.js
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

/**
 * GridFS Configuration
 * - Initialize GridFS bucket for file storage
 * - Provides bucket instance for file operations
 */

let gridfsBucket;

export const initGridFS = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not established");
  }

  gridfsBucket = new GridFSBucket(db, {
    bucketName: "uploads", // Collection names: uploads.files, uploads.chunks
  });

  console.log("GridFS initialized");
  return gridfsBucket;
};

export const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error("GridFS not initialized. Call initGridFS first.");
  }
  return gridfsBucket;
};
