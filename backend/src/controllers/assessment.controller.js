// src/controllers/assessment.controller.js
import * as assessmentService from "../services/assessment.service.js";
import { success, error } from "../utils/response.util.js";

/**
 * Assessment Controller
 */

export const getQuestions = async (req, res) => {
  try {
    const questions = assessmentService.getAssessmentQuestions();

    return success(res, { questions, count: questions.length });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const startAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const assessment = await assessmentService.startAssessment(userId);

    return success(
      res,
      { assessment },
      "Assessment started successfully. Please submit your answers.",
      201
    );
  } catch (err) {
    if (err.code === "NOT_JOBSEEKER") {
      return error(res, err.message, 403);
    }
    if (err.code === "ASSESSMENT_COMPLETED") {
      return error(res, err.message, 400);
    }
    return error(res, err.message, 500);
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { answers } = req.body;

    const result = await assessmentService.submitAssessment(userId, answers);

    return success(res, result, "Assessment submitted successfully");
  } catch (err) {
    if (
      err.code === "PROFILE_NOT_FOUND" ||
      err.code === "ASSESSMENT_NOT_FOUND"
    ) {
      return error(res, err.message, 404);
    }
    if (
      err.code === "ALREADY_SUBMITTED" ||
      err.code === "INCOMPLETE_ANSWERS" ||
      err.code === "INVALID_QUESTION" ||
      err.code === "MISSING_OPTION"
    ) {
      return error(res, err.message, 400);
    }
    return error(res, err.message, 500);
  }
};

export const getResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await assessmentService.getAssessmentResult(userId);

    return success(res, result);
  } catch (err) {
    if (err.code === "ASSESSMENT_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    if (err.code === "ASSESSMENT_INCOMPLETE") {
      return error(res, err.message, 400);
    }
    return error(res, err.message, 500);
  }
};

export const checkStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = await assessmentService.checkAssessmentStatus(userId);

    return success(res, status);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const retakeAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const assessment = await assessmentService.retakeAssessment(userId);

    return success(res, { assessment }, "Assessment reset. You can now retake it.");
  } catch (err) {
    return error(res, err.message, 500);
  }
};
