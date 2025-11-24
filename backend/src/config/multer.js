// src/config/multer.js
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import path from "path";

/**
 * Multer Configuration for GridFS
 * - Configures file upload storage
 * - Validates file types and sizes
 */

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobportal";

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

// GridFS Storage Configuration
const storage = new GridFsStorage({
  url: MONGO_URI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
      metadata: {
        userId: req.user?.userId,
        originalName: file.originalname,
        uploadedAt: new Date(),
      },
    };
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG images are allowed."), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, and TXT documents are allowed."
      ),
      false
    );
  }
};

// File filter for all allowed types
const allFilesFilter = (req, file, cb) => {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};

// Multer upload configurations
export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter,
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: documentFileFilter,
});

export const uploadAny = multer({
  storage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: allFilesFilter,
});

// Export constants for validation
export const FILE_CONSTANTS = {
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
};
