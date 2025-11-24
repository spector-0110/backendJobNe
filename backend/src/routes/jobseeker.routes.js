// src/routes/jobseeker.routes.js
import express from "express";
import {
  createProfile,
  getProfile,
  getProfileById,
  updateProfile,
  uploadResume,
  uploadCoverLetter,
  uploadProfilePhoto,
  deleteResume,
  deleteCoverLetter,
  deleteProfilePhoto,
  searchJobSeekers,
  deleteProfile,
} from "../controllers/jobseeker.controller.js";
import { requireAuth, permit } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import {
  handleDocumentUpload,
  handleImageUpload,
} from "../middlewares/upload.middleware.js";
import {
  createProfileSchema,
  updateProfileSchema,
} from "../validators/jobseeker.validator.js";

const router = express.Router();

/**
 * Job Seeker Profile Routes
 * All routes require authentication
 * Role-specific routes restricted to job seekers
 */

// Profile CRUD
router.post(
  "/profile",
  requireAuth,
  permit("jobseeker"),
  validateBody(createProfileSchema),
  createProfile
);

router.get("/profile", requireAuth, permit("jobseeker"), getProfile);

router.get("/profile/:id", requireAuth, getProfileById);

router.put(
  "/profile",
  requireAuth,
  permit("jobseeker"),
  validateBody(updateProfileSchema),
  updateProfile
);

router.delete("/profile", requireAuth, permit("jobseeker"), deleteProfile);

// File uploads
router.post(
  "/profile/resume",
  requireAuth,
  permit("jobseeker"),
  handleDocumentUpload("resume"),
  uploadResume
);

router.post(
  "/profile/cover-letter",
  requireAuth,
  permit("jobseeker"),
  handleDocumentUpload("coverLetter"),
  uploadCoverLetter
);

router.post(
  "/profile/photo",
  requireAuth,
  permit("jobseeker"),
  handleImageUpload("photo"),
  uploadProfilePhoto
);

// File deletions
router.delete("/profile/resume", requireAuth, permit("jobseeker"), deleteResume);

router.delete("/profile/cover-letter", requireAuth, permit("jobseeker"), deleteCoverLetter);

router.delete("/profile/photo", requireAuth, permit("jobseeker"), deleteProfilePhoto);

// Search job seekers (accessible by employers/admins)
router.get(
  "/search",
  requireAuth,
  permit("employer", "admin"),
  searchJobSeekers
);

export default router;
