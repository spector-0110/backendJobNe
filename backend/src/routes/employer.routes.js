// src/routes/employer.routes.js
import express from "express";
import {
  createProfile,
  getProfile,
  getProfileById,
  updateProfile,
  uploadLogo,
  addOfficeImage,
  removeOfficeImage,
  deleteLogo,
  searchEmployers,
  verifyEmployer,
  deleteProfile,
} from "../controllers/employer.controller.js";
import { requireAuth, permit } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import { handleImageUpload } from "../middlewares/upload.middleware.js";
import {
  createProfileSchema,
  updateProfileSchema,
  verifySchema,
} from "../validators/employer.validator.js";

const router = express.Router();

/**
 * Employer Profile Routes
 * All routes require authentication
 * Role-specific routes restricted to employers
 */

// Profile CRUD
router.post(
  "/profile",
  requireAuth,
  permit("employer"),
  validateBody(createProfileSchema),
  createProfile
);

router.get("/profile", requireAuth, permit("employer"), getProfile);

router.get("/profile/:id", requireAuth, getProfileById);

router.put(
  "/profile",
  requireAuth,
  permit("employer"),
  validateBody(updateProfileSchema),
  updateProfile
);

router.delete("/profile", requireAuth, permit("employer"), deleteProfile);

// Logo upload
router.post(
  "/profile/logo",
  requireAuth,
  permit("employer"),
  handleImageUpload("logo"),
  uploadLogo
);

router.delete("/profile/logo", requireAuth, permit("employer"), deleteLogo);

// Office images
router.post(
  "/profile/office-image",
  requireAuth,
  permit("employer"),
  handleImageUpload("officeImage"),
  addOfficeImage
);

router.delete(
  "/profile/office-image/:fileId",
  requireAuth,
  permit("employer"),
  removeOfficeImage
);

// Search employers (public access for job seekers)
router.get("/search", requireAuth, searchEmployers);

// Admin only: Verify employer
router.put(
  "/verify/:userId",
  requireAuth,
  permit("admin"),
  validateBody(verifySchema),
  verifyEmployer
);

export default router;
