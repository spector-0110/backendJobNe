// src/repositories/jobseeker.repository.js
import JobSeekerProfile from "../models/jobSeekerProfile.js";

/**
 * Job Seeker Profile Repository
 */

export const createJobSeekerProfile = async (payload) => {
  return JobSeekerProfile.create(payload);
};

export const findJobSeekerProfileByUserId = async (userId) => {
  return JobSeekerProfile.findOne({ userId }).lean();
};

export const findJobSeekerProfileById = async (id) => {
  return JobSeekerProfile.findById(id).lean();
};

export const updateJobSeekerProfile = async (userId, updates) => {
  return JobSeekerProfile.findOneAndUpdate({ userId }, updates, {
    new: true,
    runValidators: true,
  });
};

export const updateProfileCompleteness = async (userId, isComplete) => {
  return JobSeekerProfile.findOneAndUpdate(
    { userId },
    { isProfileComplete: isComplete },
    { new: true }
  );
};

export const findJobSeekersBySkills = async (skills, limit = 50) => {
  return JobSeekerProfile.find({
    skills: { $in: skills },
    isProfileComplete: true,
  })
    .limit(limit)
    .lean();
};

export const searchJobSeekers = async (filters, limit = 20, skip = 0) => {
  const query = { isProfileComplete: true };

  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }

  if (filters.experienceYears) {
    query.experienceYears = { $gte: filters.experienceYears };
  }

  if (filters.locations && filters.locations.length > 0) {
    query.preferredLocations = { $in: filters.locations };
  }

  return JobSeekerProfile.find(query)
    .populate("userId", "name email")
    .limit(limit)
    .skip(skip)
    .lean();
};

export const updateFileReference = async (userId, fileType, fileId) => {
  const updateField = {
    resume: "resumeFileId",
    coverLetter: "coverLetterFileId",
    photo: "profilePhotoId",
    personalityReport: "personalityReportId",
  };

  return JobSeekerProfile.findOneAndUpdate(
    { userId },
    { [updateField[fileType]]: fileId },
    { new: true }
  );
};

export const deleteJobSeekerProfile = async (userId) => {
  return JobSeekerProfile.findOneAndDelete({ userId });
};
