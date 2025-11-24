// src/controllers/job.controller.js
import * as jobService from "../services/job.service.js";
import { success, error } from "../utils/response.util.js";

/**
 * Job Controller
 */

export const createJob = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const job = await jobService.createJob(employerId, req.body);

    return success(res, { job }, "Job posted successfully", 201);
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(id);

    return success(res, { job });
  } catch (err) {
    if (err.code === "JOB_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    return error(res, err.message, 500);
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.userId;

    const job = await jobService.updateJob(id, employerId, req.body);

    return success(res, { job }, "Job updated successfully");
  } catch (err) {
    if (err.code === "JOB_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    if (err.code === "UNAUTHORIZED") {
      return error(res, err.message, 403);
    }
    return error(res, err.message, 500);
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.userId;

    await jobService.deleteJob(id, employerId);

    return success(res, {}, "Job deleted successfully");
  } catch (err) {
    if (err.code === "JOB_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    if (err.code === "UNAUTHORIZED") {
      return error(res, err.message, 403);
    }
    return error(res, err.message, 500);
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const jobs = await jobService.getEmployerJobs(
      employerId,
      parseInt(limit),
      skip
    );

    return success(res, {
      jobs,
      count: jobs.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const searchJobs = async (req, res) => {
  try {
    const {
      skills,
      location,
      jobType,
      experienceLevel,
      minSalary,
      searchText,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};
    if (skills) filters.skills = skills.split(",");
    if (location) filters.location = location;
    if (jobType) filters.jobType = jobType;
    if (experienceLevel) filters.experienceLevel = experienceLevel;
    if (minSalary) filters.minSalary = parseInt(minSalary);
    if (searchText) filters.searchText = searchText;

    const skip = (page - 1) * limit;
    const jobs = await jobService.searchJobs(filters, parseInt(limit), skip);

    // Get total count for pagination
    const totalCount = await jobService.getTotalJobsCount(filters);

    return success(res, {
      jobs,
      count: jobs.length,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const getMatchedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;
    const jobs = await jobService.getMatchedJobs(userId, parseInt(limit), skip);

    return success(res, {
      jobs,
      count: jobs.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    if (err.code === "PROFILE_NOT_FOUND") {
      return error(res, err.message, 404);
    }
    if (err.code === "PROFILE_INCOMPLETE") {
      return error(res, err.message, 400);
    }
    return error(res, err.message, 500);
  }
};

export const getJobStats = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const stats = await jobService.getJobStats(employerId);

    return success(res, { stats });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
