// src/routes/file.routes.js
import express from "express";
import {
  downloadFile,
  viewFile,
  deleteFile,
  getFileInfo,
  getUserFiles,
} from "../controllers/file.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * File routes:
 * - GET /api/files/:fileId/download - Download file
 * - GET /api/files/:fileId/view - View file inline
 * - GET /api/files/:fileId/info - Get file metadata
 * - DELETE /api/files/:fileId - Delete file
 * - GET /api/files/my-files - Get user's files
 */

router.get("/:fileId/download", requireAuth, downloadFile);
router.get("/:fileId/view", requireAuth, viewFile);
router.get("/:fileId/info", requireAuth, getFileInfo);
router.delete("/:fileId", requireAuth, deleteFile);
router.get("/my-files", requireAuth, getUserFiles);

export default router;
