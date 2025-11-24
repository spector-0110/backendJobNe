// src/routes/assessment.routes.js
import express from "express";
import {
  getQuestions,
  startAssessment,
  submitAssessment,
  getResult,
  checkStatus,
  retakeAssessment,
} from "../controllers/assessment.controller.js";
import { requireAuth, permit } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import { submitAssessmentSchema } from "../validators/assessment.validator.js";

const router = express.Router();

/**
 * Assessment Routes
 * All routes require authentication
 * Most routes restricted to job seekers
 */

// Get assessment questions (job seekers only)
router.get("/questions", requireAuth, permit("jobseeker"), getQuestions);

// Start assessment (creates assessment record)
router.post("/start", requireAuth, permit("jobseeker"), startAssessment);

// Submit assessment answers
router.post(
  "/submit",
  requireAuth,
  permit("jobseeker"),
  validateBody(submitAssessmentSchema),
  submitAssessment
);

// Get assessment result
router.get("/result", requireAuth, permit("jobseeker"), getResult);

// Check assessment status
router.get("/status", requireAuth, permit("jobseeker"), checkStatus);

// Retake assessment (deletes previous and creates new)
router.post("/retake", requireAuth, permit("jobseeker"), retakeAssessment);

export default router;
