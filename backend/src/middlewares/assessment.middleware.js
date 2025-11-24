// src/middlewares/assessment.middleware.js
import * as assessmentRepo from "../repositories/assessment.repository.js";

/**
 * Assessment Middleware
 * - Checks if job seeker has completed personality assessment
 * - Required before applying for jobs
 */

export const requireAssessment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Only apply to job seekers
    if (role !== "jobseeker") {
      return next();
    }

    // Check if assessment exists and is completed
    const assessment = await assessmentRepo.findAssessmentByUserId(userId);

    if (!assessment) {
      return res.status(403).json({
        success: false,
        message:
          "You must complete the personality assessment before applying for jobs. Please visit /api/assessment/start to begin.",
        code: "ASSESSMENT_REQUIRED",
      });
    }

    if (!assessment.score && assessment.score !== 0) {
      return res.status(403).json({
        success: false,
        message:
          "You have started but not completed the personality assessment. Please submit your answers at /api/assessment/submit",
        code: "ASSESSMENT_INCOMPLETE",
      });
    }

    // Assessment completed, continue
    return next();
  } catch (err) {
    console.error("Assessment middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Error checking assessment status",
    });
  }
};
