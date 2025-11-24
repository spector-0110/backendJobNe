// src/middlewares/upload.middleware.js
import { uploadImage, uploadDocument, uploadAny } from "../config/multer.js";

/**
 * Upload Middleware
 * - Wraps multer upload handlers with error handling
 */

export const handleImageUpload = (fieldName) => {
  return (req, res, next) => {
    const upload = uploadImage.single(fieldName);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }
      next();
    });
  };
};

export const handleDocumentUpload = (fieldName) => {
  return (req, res, next) => {
    const upload = uploadDocument.single(fieldName);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Document upload failed",
        });
      }
      next();
    });
  };
};

export const handleMultipleImages = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const upload = uploadImage.array(fieldName, maxCount);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Multiple images upload failed",
        });
      }
      next();
    });
  };
};

export const handleAnyFileUpload = (fieldName) => {
  return (req, res, next) => {
    const upload = uploadAny.single(fieldName);
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  };
};
