// src/repositories/user.repository.js
import User from "../models/user.js";

/**
 * User Repository
 * - Encapsulates all database operations for User model
 * - Returns lean objects for read operations (better performance)
 */

export const createUser = async (payload) => {
  return User.create(payload);
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email }).lean();
};

export const findUserById = async (id) => {
  return User.findById(id).lean();
};

export const findUserByIdWithProfile = async (id, role) => {
  const populateField = role === "jobseeker" ? "jobSeekerProfileId" : "employerProfileId";
  return User.findById(id).populate(populateField).lean();
};

export const updateUser = async (id, updates) => {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

export const updateLastLogin = async (id) => {
  return User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true });
};

export const linkJobSeekerProfile = async (userId, profileId) => {
  return User.findByIdAndUpdate(userId, { jobSeekerProfileId: profileId }, { new: true });
};

export const linkEmployerProfile = async (userId, profileId) => {
  return User.findByIdAndUpdate(userId, { employerProfileId: profileId }, { new: true });
};

export const deactivateUser = async (id) => {
  return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

export const searchUsers = async (query, limit = 20, skip = 0) => {
  return User.find(query)
    .select("-passwordHash")
    .limit(limit)
    .skip(skip)
    .lean();
};

export const getUserStats = async () => {
  return User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);
};
