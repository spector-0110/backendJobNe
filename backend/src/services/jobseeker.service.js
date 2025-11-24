// src/services/jobseeker.service.js
import * as jobseekerRepo from "../repositories/jobseeker.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import * as fileService from "./file.service.js";

/**
 * Job Seeker Service
 * - Handles job seeker profile business logic
 */

export const createProfile = async (userId, profileData) => {
  // Check if profile already exists
  const existing = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (existing) {
    const error = new Error("Profile already exists");
    error.code = "PROFILE_EXISTS";
    throw error;
  }

  // Create profile
  const profile = await jobseekerRepo.createJobSeekerProfile({
    userId,
    ...profileData,
  });

  // Link profile to user
  await userRepo.linkJobSeekerProfile(userId, profile._id);

  return profile;
};

export const getProfile = async (userId) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const getProfileById = async (profileId) => {
  const profile = await jobseekerRepo.findJobSeekerProfileById(profileId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await jobseekerRepo.updateJobSeekerProfile(userId, updates);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Check if profile is complete
  const isComplete = checkProfileCompleteness(profile);
  if (isComplete !== profile.isProfileComplete) {
    await jobseekerRepo.updateProfileCompleteness(userId, isComplete);
    profile.isProfileComplete = isComplete;
  }

  return profile;
};

export const uploadResume = async (userId, file) => {
  // Get existing profile
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Delete old resume if exists
  if (profile.resumeFileId) {
    try {
      await fileService.deleteFile(profile.resumeFileId);
    } catch (err) {
      console.error("Error deleting old resume:", err);
    }
  }

  // File already uploaded by multer, just update reference
  const updatedProfile = await jobseekerRepo.updateFileReference(
    userId,
    "resume",
    file.id
  );

  return updatedProfile;
};

export const uploadCoverLetter = async (userId, file) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Delete old cover letter if exists
  if (profile.coverLetterFileId) {
    try {
      await fileService.deleteFile(profile.coverLetterFileId);
    } catch (err) {
      console.error("Error deleting old cover letter:", err);
    }
  }

  const updatedProfile = await jobseekerRepo.updateFileReference(
    userId,
    "coverLetter",
    file.id
  );

  return updatedProfile;
};

export const uploadProfilePhoto = async (userId, file) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Delete old photo if exists
  if (profile.profilePhotoId) {
    try {
      await fileService.deleteFile(profile.profilePhotoId);
    } catch (err) {
      console.error("Error deleting old photo:", err);
    }
  }

  const updatedProfile = await jobseekerRepo.updateFileReference(
    userId,
    "photo",
    file.id
  );

  return updatedProfile;
};

export const deleteResume = async (userId) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile || !profile.resumeFileId) {
    const error = new Error("Resume not found");
    error.code = "FILE_NOT_FOUND";
    throw error;
  }

  await fileService.deleteFile(profile.resumeFileId);
  const updatedProfile = await jobseekerRepo.updateFileReference(
    userId,
    "resume",
    null
  );

  return updatedProfile;
};

export const deleteCoverLetter = async (userId) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile || !profile.coverLetterFileId) {
    const error = new Error("Cover letter not found");
    error.code = "FILE_NOT_FOUND";
    throw error;
  }

  await fileService.deleteFile(profile.coverLetterFileId);
  const updatedProfile = await jobseekerRepo.updateFileReference(
    userId,
    "coverLetter",
    null
  );

  return updatedProfile;
};

export const deleteProfilePhoto = async (userId) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile || !profile.profilePhotoId) {
    const error = new Error("Profile photo not found");
    error.code = "FILE_NOT_FOUND";
    throw error;
  }

  await fileService.deleteFile(profile.profilePhotoId);
  const updatedProfile = await jobseekerRepo.updateFileReference(
    userId,
    "photo",
    null
  );

  return updatedProfile;
};

export const searchJobSeekers = async (filters, limit = 20, skip = 0) => {
  return jobseekerRepo.searchJobSeekers(filters, limit, skip);
};

export const deleteProfile = async (userId) => {
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Delete associated files
  const filesToDelete = [
    profile.resumeFileId,
    profile.coverLetterFileId,
    profile.profilePhotoId,
    profile.personalityReportId,
  ].filter(Boolean);

  if (filesToDelete.length > 0) {
    try {
      await fileService.deleteMultipleFiles(filesToDelete);
    } catch (err) {
      console.error("Error deleting profile files:", err);
    }
  }

  // Delete profile
  await jobseekerRepo.deleteJobSeekerProfile(userId);

  // Unlink from user
  await userRepo.linkJobSeekerProfile(userId, null);

  return true;
};

// Helper function to check profile completeness
const checkProfileCompleteness = (profile) => {
  const requiredFields = [
    profile.headline,
    profile.skills && profile.skills.length > 0,
    profile.experienceYears !== undefined,
    profile.preferredLocations && profile.preferredLocations.length > 0,
    profile.salaryExpectation?.min,
    profile.jobTypes && profile.jobTypes.length > 0,
    profile.resumeFileId,
  ];

  return requiredFields.every((field) => !!field);
};
