// src/controllers/jobseeker.controller.js
import * as jobseekerService from "../services/jobseeker.service.js";
import { success, error } from "../utils/response.util.js";

/**
 * Job Seeker Profile Controller
 */

export const createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await jobseekerService.createProfile(userId, req.body);

    return success(res, { profile }, "Profile created successfully", 201);
  } catch (err) {
    if (err.code === "PROFILE_EXISTS") {
      return error(res, err.message, 400);
    }
    return error(res, err.message, 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await jobseekerService.getProfile(userId);

    return success(res, { profile });
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await jobseekerService.getProfileById(id);

    return success(res, { profile });
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await jobseekerService.updateProfile(userId, req.body);

    return success(res, { profile }, "Profile updated successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const profile = await jobseekerService.uploadResume(userId, req.file);

    return success(res, { profile }, "Resume uploaded successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const uploadCoverLetter = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const profile = await jobseekerService.uploadCoverLetter(userId, req.file);

    return success(res, { profile }, "Cover letter uploaded successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const profile = await jobseekerService.uploadProfilePhoto(userId, req.file);

    return success(res, { profile }, "Profile photo uploaded successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await jobseekerService.deleteResume(userId);

    return success(res, { profile }, "Resume deleted successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND" || err.code === "FILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const deleteCoverLetter = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await jobseekerService.deleteCoverLetter(userId);

    return success(res, { profile }, "Cover letter deleted successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND" || err.code === "FILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await jobseekerService.deleteProfilePhoto(userId);

    return success(res, { profile }, "Profile photo deleted successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND" || err.code === "FILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const searchJobSeekers = async (req, res) => {
  try {
    const { skills, experienceYears, locations, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (skills) filters.skills = skills.split(",");
    if (experienceYears) filters.experienceYears = parseInt(experienceYears);
    if (locations) filters.locations = locations.split(",");

    const skip = (page - 1) * limit;
    const jobSeekers = await jobseekerService.searchJobSeekers(
      filters,
      parseInt(limit),
      skip
    );

    return success(res, {
      jobSeekers,
      count: jobSeekers.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    await jobseekerService.deleteProfile(userId);

    return success(res, {}, "Profile deleted successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};
