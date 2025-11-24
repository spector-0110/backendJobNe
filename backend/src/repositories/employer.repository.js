// src/repositories/employer.repository.js
import EmployerProfile from "../models/employerProfile.js";

/**
 * Employer Profile Repository
 */

export const createEmployerProfile = async (payload) => {
  return EmployerProfile.create(payload);
};

export const findEmployerProfileByUserId = async (userId) => {
  return EmployerProfile.findOne({ userId }).lean();
};

export const findEmployerProfileById = async (id) => {
  return EmployerProfile.findById(id).lean();
};

export const updateEmployerProfile = async (userId, updates) => {
  return EmployerProfile.findOneAndUpdate({ userId }, updates, {
    new: true,
    runValidators: true,
  });
};

export const searchEmployers = async (filters, limit = 20, skip = 0) => {
  const query = {};

  if (filters.industry) {
    query.industry = filters.industry;
  }

  if (filters.companySize) {
    query.companySize = filters.companySize;
  }

  if (filters.location) {
    query.headquartersLocation = new RegExp(filters.location, "i");
  }

  if (filters.verified !== undefined) {
    query.isVerified = filters.verified;
  }

  return EmployerProfile.find(query)
    .populate("userId", "name email")
    .limit(limit)
    .skip(skip)
    .lean();
};

export const updateFileReference = async (userId, fileType, fileId) => {
  if (fileType === "logo") {
    return EmployerProfile.findOneAndUpdate(
      { userId },
      { logoFileId: fileId },
      { new: true }
    );
  } else if (fileType === "officeImage") {
    return EmployerProfile.findOneAndUpdate(
      { userId },
      { $push: { officeImages: fileId } },
      { new: true }
    );
  }
};

export const removeOfficeImage = async (userId, fileId) => {
  return EmployerProfile.findOneAndUpdate(
    { userId },
    { $pull: { officeImages: fileId } },
    { new: true }
  );
};

export const verifyEmployer = async (userId, isVerified) => {
  return EmployerProfile.findOneAndUpdate(
    { userId },
    { isVerified },
    { new: true }
  );
};

export const deleteEmployerProfile = async (userId) => {
  return EmployerProfile.findOneAndDelete({ userId });
};
