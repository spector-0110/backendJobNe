// src/controllers/file.controller.js
import * as fileService from "../services/file.service.js";
import { success, error } from "../utils/response.util.js";

/**
 * File Controller
 * - Handles file download and deletion requests
 */

export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file metadata
    const file = await fileService.getFileById(fileId);

    // Set response headers
    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Content-Length": file.length,
    });

    // Stream file to response
    const downloadStream = fileService.getFileStream(fileId);

    downloadStream.on("error", (err) => {
      console.error("File download error:", err);
      if (!res.headersSent) {
        return error(res, "File download failed", 500);
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    if (err.code === "FILE_NOT_FOUND") {
      return error(res, "File not found", 404);
    }
    return error(res, err.message, 500);
  }
};

export const viewFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file metadata
    const file = await fileService.getFileById(fileId);

    // Set response headers for inline viewing
    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Content-Length": file.length,
    });

    // Stream file to response
    const downloadStream = fileService.getFileStream(fileId);

    downloadStream.on("error", (err) => {
      console.error("File view error:", err);
      if (!res.headersSent) {
        return error(res, "File view failed", 500);
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    if (err.code === "FILE_NOT_FOUND") {
      return error(res, "File not found", 404);
    }
    return error(res, err.message, 500);
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if file exists
    const exists = await fileService.fileExists(fileId);
    if (!exists) {
      return error(res, "File not found", 404);
    }

    // Delete file
    await fileService.deleteFile(fileId);

    return success(res, {}, "File deleted successfully");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await fileService.getFileById(fileId);

    return success(res, {
      id: file._id,
      filename: file.filename,
      contentType: file.contentType,
      size: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata,
    });
  } catch (err) {
    if (err.code === "FILE_NOT_FOUND") {
      return error(res, "File not found", 404);
    }
    return error(res, err.message, 500);
  }
};

export const getUserFiles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const files = await fileService.getFilesByUserId(userId);

    const filesData = files.map((file) => ({
      id: file._id,
      filename: file.filename,
      contentType: file.contentType,
      size: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata,
    }));

    return success(res, { files: filesData, count: files.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
