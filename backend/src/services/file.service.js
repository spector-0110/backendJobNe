// src/services/file.service.js
import { getGridFSBucket } from "../config/gridfs.js";
import mongoose from "mongoose";
import { Readable } from "stream";

/**
 * File Service
 * - Handles file upload, download, and deletion with GridFS
 * - Provides file metadata retrieval
 */

/**
 * Upload file buffer to GridFS
 * @param {Buffer} buffer - File buffer
 * @param {String} filename - File name
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<ObjectId>} - File ID
 */
export const uploadFileBuffer = async (buffer, filename, metadata = {}) => {
  const bucket = getGridFSBucket();

  return new Promise((resolve, reject) => {
    const readableStream = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
      },
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id);
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });
  });
};

/**
 * Get file by ID
 * @param {String|ObjectId} fileId - File ID
 * @returns {Promise<Object>} - File metadata
 */
export const getFileById = async (fileId) => {
  const bucket = getGridFSBucket();
  const files = await bucket
    .find({ _id: new mongoose.Types.ObjectId(fileId) })
    .toArray();

  if (!files || files.length === 0) {
    const error = new Error("File not found");
    error.code = "FILE_NOT_FOUND";
    throw error;
  }

  return files[0];
};

/**
 * Get file download stream
 * @param {String|ObjectId} fileId - File ID
 * @returns {Stream} - Download stream
 */
export const getFileStream = (fileId) => {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

/**
 * Delete file by ID
 * @param {String|ObjectId} fileId - File ID
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileId) => {
  const bucket = getGridFSBucket();
  await bucket.delete(new mongoose.Types.ObjectId(fileId));
};

/**
 * Get files by user ID
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of file metadata
 */
export const getFilesByUserId = async (userId) => {
  const bucket = getGridFSBucket();
  return bucket.find({ "metadata.userId": userId }).toArray();
};

/**
 * Update file metadata
 * @param {String|ObjectId} fileId - File ID
 * @param {Object} metadata - New metadata
 * @returns {Promise<void>}
 */
export const updateFileMetadata = async (fileId, metadata) => {
  const db = mongoose.connection.db;
  const filesCollection = db.collection("uploads.files");

  await filesCollection.updateOne(
    { _id: new mongoose.Types.ObjectId(fileId) },
    { $set: { "metadata": metadata } }
  );
};

/**
 * Check if file exists
 * @param {String|ObjectId} fileId - File ID
 * @returns {Promise<Boolean>}
 */
export const fileExists = async (fileId) => {
  try {
    await getFileById(fileId);
    return true;
  } catch (error) {
    if (error.code === "FILE_NOT_FOUND") {
      return false;
    }
    throw error;
  }
};

/**
 * Get file size
 * @param {String|ObjectId} fileId - File ID
 * @returns {Promise<Number>} - File size in bytes
 */
export const getFileSize = async (fileId) => {
  const file = await getFileById(fileId);
  return file.length;
};

/**
 * Delete multiple files
 * @param {Array<String|ObjectId>} fileIds - Array of file IDs
 * @returns {Promise<void>}
 */
export const deleteMultipleFiles = async (fileIds) => {
  const bucket = getGridFSBucket();
  const deletePromises = fileIds.map((id) =>
    bucket.delete(new mongoose.Types.ObjectId(id))
  );
  await Promise.all(deletePromises);
};

/**
 * Get all files with pagination
 * @param {Number} limit - Limit
 * @param {Number} skip - Skip
 * @returns {Promise<Array>} - Array of file metadata
 */
export const getAllFiles = async (limit = 50, skip = 0) => {
  const bucket = getGridFSBucket();
  return bucket.find().skip(skip).limit(limit).toArray();
};

/**
 * Delete orphaned files (files not referenced in any model)
 * This should be run as a cleanup cron job
 * @returns {Promise<Number>} - Number of deleted files
 */
export const cleanupOrphanedFiles = async () => {
  // Import models
  const JobSeekerProfile = (await import("../models/jobSeekerProfile.js")).default;
  const EmployerProfile = (await import("../models/employerProfile.js")).default;
  const Assessment = (await import("../models/assessment.js")).default;
  const Message = (await import("../models/message.js")).default;

  // Get all file IDs from GridFS
  const bucket = getGridFSBucket();
  const allFiles = await bucket.find().toArray();
  const allFileIds = allFiles.map((f) => f._id.toString());

  // Get all referenced file IDs from models
  const referencedIds = new Set();

  // JobSeeker files
  const jobSeekers = await JobSeekerProfile.find().lean();
  jobSeekers.forEach((js) => {
    if (js.resumeFileId) referencedIds.add(js.resumeFileId.toString());
    if (js.coverLetterFileId) referencedIds.add(js.coverLetterFileId.toString());
    if (js.profilePhotoId) referencedIds.add(js.profilePhotoId.toString());
    if (js.personalityReportId) referencedIds.add(js.personalityReportId.toString());
  });

  // Employer files
  const employers = await EmployerProfile.find().lean();
  employers.forEach((emp) => {
    if (emp.logoFileId) referencedIds.add(emp.logoFileId.toString());
    if (emp.officeImages) {
      emp.officeImages.forEach((id) => referencedIds.add(id.toString()));
    }
  });

  // Assessment files
  const assessments = await Assessment.find().lean();
  assessments.forEach((assess) => {
    if (assess.reportFileId) referencedIds.add(assess.reportFileId.toString());
  });

  // Message attachments
  const messages = await Message.find().lean();
  messages.forEach((msg) => {
    if (msg.attachmentFileId) referencedIds.add(msg.attachmentFileId.toString());
  });

  // Find orphaned files
  const orphanedIds = allFileIds.filter((id) => !referencedIds.has(id));

  // Delete orphaned files
  if (orphanedIds.length > 0) {
    await deleteMultipleFiles(orphanedIds);
  }

  return orphanedIds.length;
};

export default {
  uploadFileBuffer,
  getFileById,
  getFileStream,
  deleteFile,
  getFilesByUserId,
  updateFileMetadata,
  fileExists,
  getFileSize,
  deleteMultipleFiles,
  getAllFiles,
  cleanupOrphanedFiles,
};
