// src/services/employer.service.js
import * as employerRepo from "../repositories/employer.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import * as fileService from "./file.service.js";

/**
 * Employer Service
 * - Handles employer profile business logic
 */

export const createProfile = async (userId, profileData) => {
  // Check if profile already exists
  const existing = await employerRepo.findEmployerProfileByUserId(userId);
  if (existing) {
    const error = new Error("Profile already exists");
    error.code = "PROFILE_EXISTS";
    throw error;
  }

  // Create profile
  const profile = await employerRepo.createEmployerProfile({
    userId,
    ...profileData,
  });

  // Link profile to user
  await userRepo.linkEmployerProfile(userId, profile._id);

  return profile;
};

export const getProfile = async (userId) => {
  const profile = await employerRepo.findEmployerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const getProfileById = async (profileId) => {
  const profile = await employerRepo.findEmployerProfileById(profileId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await employerRepo.updateEmployerProfile(userId, updates);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const uploadLogo = async (userId, file) => {
  // Get existing profile
  const profile = await employerRepo.findEmployerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Delete old logo if exists
  if (profile.logoFileId) {
    try {
      await fileService.deleteFile(profile.logoFileId);
    } catch (err) {
      console.error("Error deleting old logo:", err);
    }
  }

  // File already uploaded by multer, just update reference
  const updatedProfile = await employerRepo.updateFileReference(
    userId,
    "logo",
    file.id
  );

  return updatedProfile;
};

export const addOfficeImage = async (userId, file) => {
  const profile = await employerRepo.findEmployerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Check limit (e.g., max 10 images)
  if (profile.officeImages && profile.officeImages.length >= 10) {
    const error = new Error("Maximum office images limit reached (10)");
    error.code = "LIMIT_REACHED";
    throw error;
  }

  const updatedProfile = await employerRepo.updateFileReference(
    userId,
    "officeImage",
    file.id
  );

  return updatedProfile;
};

export const removeOfficeImage = async (userId, fileId) => {
  const profile = await employerRepo.findEmployerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Check if image exists in profile
  if (!profile.officeImages || !profile.officeImages.includes(fileId)) {
    const error = new Error("Image not found in profile");
    error.code = "IMAGE_NOT_FOUND";
    throw error;
  }

  // Delete file from GridFS
  await fileService.deleteFile(fileId);

  // Remove from profile
  const updatedProfile = await employerRepo.removeOfficeImage(userId, fileId);

  return updatedProfile;
};

export const deleteLogo = async (userId) => {
  const profile = await employerRepo.findEmployerProfileByUserId(userId);
  if (!profile || !profile.logoFileId) {
    const error = new Error("Logo not found");
    error.code = "FILE_NOT_FOUND";
    throw error;
  }

  await fileService.deleteFile(profile.logoFileId);
  const updatedProfile = await employerRepo.updateFileReference(
    userId,
    "logo",
    null
  );

  return updatedProfile;
};

export const searchEmployers = async (filters, limit = 20, skip = 0) => {
  return employerRepo.searchEmployers(filters, limit, skip);
};

export const verifyEmployer = async (userId, isVerified) => {
  const profile = await employerRepo.verifyEmployer(userId, isVerified);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const deleteProfile = async (userId) => {
  const profile = await employerRepo.findEmployerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Delete associated files
  const filesToDelete = [profile.logoFileId, ...(profile.officeImages || [])].filter(
    Boolean
  );

  if (filesToDelete.length > 0) {
    try {
      await fileService.deleteMultipleFiles(filesToDelete);
    } catch (err) {
      console.error("Error deleting profile files:", err);
    }
  }

  // Delete profile
  await employerRepo.deleteEmployerProfile(userId);

  // Unlink from user
  await userRepo.linkEmployerProfile(userId, null);

  return true;
};
