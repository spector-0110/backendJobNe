import express from "express";
import applicationController from "../controllers/application.controller.js";
import { requireAuth, permit } from "../middlewares/auth.middleware.js";
import { requireAssessment } from "../middlewares/assessment.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import {
  applyForJobSchema,
  updateApplicationStatusSchema,
} from "../validators/application.validator.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Job Seeker Routes - Apply for job (requires assessment completion)
router.post(
  "/apply",
  permit("jobseeker"),
  requireAssessment,
  validateBody(applyForJobSchema),
  applicationController.applyForJob
);

// Job Seeker - Get my applications
router.get(
  "/my",
  permit("jobseeker"),
  applicationController.getMyApplications
);

// Job Seeker - Get application statistics
router.get(
  "/stats/me",
  permit("jobseeker"),
  applicationController.getApplicationStats
);

// Job Seeker - Withdraw application
router.put(
  "/:id/withdraw",
  permit("jobseeker"),
  applicationController.withdrawApplication
);

// Employer Routes - Get applications for employer's jobs
router.get(
  "/employer",
  permit("employer"),
  applicationController.getApplicationsForEmployer
);

// Employer - Get application statistics
router.get(
  "/stats/employer",
  permit("employer"),
  applicationController.getEmployerApplicationStats
);

// Employer - Update application status
router.put(
  "/:id/status",
  permit("employer"),
  validateBody(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

// Common Routes - Get application by ID (both job seeker and employer)
router.get("/:id", applicationController.getApplicationById);

// Job Seeker - Delete application (only withdrawn/rejected)
router.delete(
  "/:id",
  permit("jobseeker"),
  applicationController.deleteApplication
);

export default router;
