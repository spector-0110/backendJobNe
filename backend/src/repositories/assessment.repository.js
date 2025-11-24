// src/repositories/assessment.repository.js
import Assessment from "../models/assessment.js";

/**
 * Assessment Repository
 */

export const createAssessment = async (payload) => {
  return Assessment.create(payload);
};

export const findAssessmentById = async (id) => {
  return Assessment.findById(id).lean();
};

export const findAssessmentByUserId = async (userId) => {
  return Assessment.findOne({ userId }).sort({ createdAt: -1 }).lean();
};

export const findAllAssessmentsByUserId = async (userId) => {
  return Assessment.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const updateAssessment = async (id, updates) => {
  return Assessment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

export const submitAssessmentAnswers = async (id, answers, score, reportFileId = null) => {
  const updates = { answers, score };
  if (reportFileId) {
    updates.reportFileId = reportFileId;
  }
  return Assessment.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteAssessment = async (id) => {
  return Assessment.findByIdAndDelete(id);
};

export const getUserAssessmentCount = async (userId) => {
  return Assessment.countDocuments({ userId });
};

export const getAverageScore = async () => {
  const result = await Assessment.aggregate([
    {
      $group: {
        _id: null,
        avgScore: { $avg: "$score" },
        totalAssessments: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { avgScore: 0, totalAssessments: 0 };
};
