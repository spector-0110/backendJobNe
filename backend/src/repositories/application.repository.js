// src/repositories/application.repository.js
import Application from "../models/application.js";

/**
 * Application Repository
 */

export const createApplication = async (payload) => {
  return Application.create(payload);
};

export const findApplicationById = async (id) => {
  return Application.findById(id)
    .populate("jobId", "title description employerId")
    .populate("jobSeekerId", "name email")
    .lean();
};

export const findApplicationByJobAndSeeker = async (jobId, jobSeekerId) => {
  return Application.findOne({ jobId, jobSeekerId }).lean();
};

export const updateApplicationStatus = async (id, status, customResponse = null) => {
  const updates = { status };
  if (customResponse) {
    updates.customResponse = customResponse;
  }
  return Application.findByIdAndUpdate(id, updates, { new: true });
};

export const withdrawApplication = async (id, jobSeekerId) => {
  return Application.findOneAndUpdate(
    { _id: id, jobSeekerId },
    { status: "withdrawn" },
    { new: true }
  );
};

export const findApplicationsByJobSeeker = async (jobSeekerId, limit = 20, skip = 0) => {
  return Application.find({ jobSeekerId })
    .populate("jobId", "title description location salary employerId")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const findApplicationsByJob = async (jobId, filters = {}, limit = 20, skip = 0) => {
  const query = { jobId };

  if (filters.status) {
    query.status = filters.status;
  }

  return Application.find(query)
    .populate("jobSeekerId", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const findApplicationsByEmployer = async (employerId, filters = {}, limit = 20, skip = 0) => {
  const pipeline = [
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job",
      },
    },
    {
      $unwind: "$job",
    },
    {
      $match: {
        "job.employerId": employerId,
      },
    },
  ];

  if (filters.status) {
    pipeline.push({
      $match: { status: filters.status },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "jobSeekerId",
        foreignField: "_id",
        as: "jobSeeker",
      },
    },
    {
      $unwind: "$jobSeeker",
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  return Application.aggregate(pipeline);
};

export const getApplicationStats = async (jobId) => {
  return Application.aggregate([
    { $match: { jobId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

export const getJobSeekerApplicationStats = async (jobSeekerId) => {
  return Application.aggregate([
    { $match: { jobSeekerId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

export const countApplicationsByJob = async (jobId) => {
  return Application.countDocuments({ jobId });
};

export const deleteApplication = async (id) => {
  return Application.findByIdAndDelete(id);
};
