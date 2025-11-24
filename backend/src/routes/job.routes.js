// src/routes/job.routes.js
import express from "express";
import {
  createJob,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  searchJobs,
  getMatchedJobs,
  getJobStats,
} from "../controllers/job.controller.js";
import { requireAuth, permit } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import { createJobSchema, updateJobSchema } from "../validators/job.validator.js";

const router = express.Router();

/**
 * Job Routes
 * All routes require authentication
 * IMPORTANT: Specific routes must come before parameterized routes
 */

// Get employer's posted jobs (must come before /:id)
router.get("/my/postings", requireAuth, permit("employer"), getMyJobs);

// Get job statistics for employer (must come before /:id)
router.get("/my/stats", requireAuth, permit("employer"), getJobStats);

// Get matched jobs for job seeker (must come before /:id)
router.get("/matched/me", requireAuth, permit("jobseeker"), getMatchedJobs);

// Search jobs (all authenticated users) - this should handle query params
// Placed before /:id to avoid conflicts
router.get("/search", requireAuth, searchJobs);

// Create job (employer only)
router.post(
  "/",
  requireAuth,
  permit("employer"),
  validateBody(createJobSchema),
  createJob
);

// Get job by ID (all authenticated users)
router.get("/:id", requireAuth, getJobById);

// Update job (employer only, must own the job)
router.put(
  "/:id",
  requireAuth,
  permit("employer"),
  validateBody(updateJobSchema),
  updateJob
);

// Delete/deactivate job (employer only, must own the job)
router.delete("/:id", requireAuth, permit("employer"), deleteJob);

export default router;
