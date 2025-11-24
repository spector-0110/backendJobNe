// src/controllers/employer.controller.js
import * as employerService from "../services/employer.service.js";
import { success, error } from "../utils/response.util.js";

/**
 * Employer Profile Controller
 */

export const createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await employerService.createProfile(userId, req.body);

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
    const profile = await employerService.getProfile(userId);

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
    const profile = await employerService.getProfileById(id);

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
    const profile = await employerService.updateProfile(userId, req.body);

    return success(res, { profile }, "Profile updated successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const profile = await employerService.uploadLogo(userId, req.file);

    return success(res, { profile }, "Logo uploaded successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const addOfficeImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return error(res, "No file uploaded", 400);
    }

    const profile = await employerService.addOfficeImage(userId, req.file);

    return success(res, { profile }, "Office image added successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    if (err.code === "LIMIT_REACHED") {
      return error(res, err.message, 400);
    }
    return error(res, err.message, 500);
  }
};

export const removeOfficeImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fileId } = req.params;

    const profile = await employerService.removeOfficeImage(userId, fileId);

    return success(res, { profile }, "Office image removed successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND" || err.code === "IMAGE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const deleteLogo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await employerService.deleteLogo(userId);

    return success(res, { profile }, "Logo deleted successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND" || err.code === "FILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const searchEmployers = async (req, res) => {
  try {
    const { industry, companySize, location, verified, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (industry) filters.industry = industry;
    if (companySize) filters.companySize = companySize;
    if (location) filters.location = location;
    if (verified !== undefined) filters.verified = verified === "true";

    const skip = (page - 1) * limit;
    const employers = await employerService.searchEmployers(
      filters,
      parseInt(limit),
      skip
    );

    return success(res, {
      employers,
      count: employers.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const verifyEmployer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const profile = await employerService.verifyEmployer(userId, isVerified);

    return success(res, { profile }, "Employer verification status updated");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    await employerService.deleteProfile(userId);

    return success(res, {}, "Profile deleted successfully");
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};
