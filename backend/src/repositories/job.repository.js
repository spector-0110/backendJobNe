// src/repositories/job.repository.js
import Job from "../models/job.js";

/**
 * Job Repository
 */

export const createJob = async (payload) => {
  // Create searchable text for full-text search
  const searchableText = `${payload.title} ${payload.description} ${payload.requiredSkills.join(" ")}`;
  return Job.create({ ...payload, searchableText });
};

export const findJobById = async (id) => {
  return Job.findById(id).populate("employerId", "name email").lean();
};

export const updateJob = async (id, updates) => {
  if (updates.title || updates.description || updates.requiredSkills) {
    const job = await Job.findById(id);
    const searchableText = `${updates.title || job.title} ${updates.description || job.description} ${(updates.requiredSkills || job.requiredSkills).join(" ")}`;
    updates.searchableText = searchableText;
  }

  return Job.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

export const deleteJob = async (id) => {
  return Job.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

export const findJobsByEmployer = async (employerId, limit = 20, skip = 0) => {
  return Job.find({ employerId, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const searchJobs = async (filters, limit = 20, skip = 0) => {
  const query = { isActive: true };

  if (filters.skills && filters.skills.length > 0) {
    query.requiredSkills = { $in: filters.skills };
  }

  if (filters.location) {
    query.location = new RegExp(filters.location, "i");
  }

  if (filters.jobType) {
    query.jobType = filters.jobType;
  }

  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel;
  }

  if (filters.minSalary) {
    query["salary.min"] = { $gte: filters.minSalary };
  }

  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }

  return Job.find(query)
    .populate("employerId", "name email")
    .sort(filters.searchText ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const findMatchingJobs = async (jobSeekerProfile, limit = 50, skip = 0) => {
  const query = { isActive: true };

  // Match based on skills
  if (jobSeekerProfile.skills && jobSeekerProfile.skills.length > 0) {
    query.requiredSkills = { $in: jobSeekerProfile.skills };
  }

  // Match based on preferred locations
  if (jobSeekerProfile.preferredLocations && jobSeekerProfile.preferredLocations.length > 0) {
    query.location = { $in: jobSeekerProfile.preferredLocations };
  }

  // Match based on job types
  if (jobSeekerProfile.jobTypes && jobSeekerProfile.jobTypes.length > 0) {
    query.jobType = { $in: jobSeekerProfile.jobTypes };
  }

  // Match based on salary expectations
  if (jobSeekerProfile.salaryExpectation && jobSeekerProfile.salaryExpectation.min) {
    query["salary.max"] = { $gte: jobSeekerProfile.salaryExpectation.min };
  }

  return Job.find(query)
    .populate("employerId", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const getJobStats = async (employerId) => {
  return Job.aggregate([
    { $match: { employerId } },
    {
      $group: {
        _id: "$isActive",
        count: { $sum: 1 },
      },
    },
  ]);
};

export const getTotalJobsCount = async (query = { isActive: true }) => {
  return Job.countDocuments(query);
};
