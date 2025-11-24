// src/services/job.service.js
import * as jobRepo from "../repositories/job.repository.js";
import * as employerRepo from "../repositories/employer.repository.js";
import * as jobseekerRepo from "../repositories/jobseeker.repository.js";

/**
 * Job Service
 * - Handles job posting and management logic
 */

export const createJob = async (employerId, jobData) => {
  // Verify employer profile exists
  const employerProfile = await employerRepo.findEmployerProfileByUserId(employerId);
  if (!employerProfile) {
    const error = new Error("Employer profile not found. Please create your profile first.");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Create job
  const job = await jobRepo.createJob({
    employerId,
    ...jobData,
  });

  return job;
};

export const getJobById = async (jobId) => {
  const job = await jobRepo.findJobById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.code = "JOB_NOT_FOUND";
    throw error;
  }
  return job;
};

export const updateJob = async (jobId, employerId, updates) => {
  // Verify job exists and belongs to employer
  const job = await jobRepo.findJobById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.code = "JOB_NOT_FOUND";
    throw error;
  }

  if (job.employerId.toString() !== employerId.toString()) {
    const error = new Error("Unauthorized to update this job");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const updatedJob = await jobRepo.updateJob(jobId, updates);
  return updatedJob;
};

export const deleteJob = async (jobId, employerId) => {
  // Verify job exists and belongs to employer
  const job = await jobRepo.findJobById(jobId);
  if (!job) {
    const error = new Error("Job not found");
    error.code = "JOB_NOT_FOUND";
    throw error;
  }

  if (job.employerId.toString() !== employerId.toString()) {
    const error = new Error("Unauthorized to delete this job");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  // Soft delete (set isActive to false)
  await jobRepo.deleteJob(jobId);
  return true;
};

export const getEmployerJobs = async (employerId, limit = 20, skip = 0) => {
  return jobRepo.findJobsByEmployer(employerId, limit, skip);
};

export const searchJobs = async (filters, limit = 20, skip = 0) => {
  return jobRepo.searchJobs(filters, limit, skip);
};

export const getMatchedJobs = async (userId, limit = 50, skip = 0) => {
  // Get job seeker profile
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Job seeker profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Check if profile is complete
  if (!profile.isProfileComplete) {
    const error = new Error("Please complete your profile to view matched jobs");
    error.code = "PROFILE_INCOMPLETE";
    throw error;
  }

  // Get matched jobs
  const jobs = await jobRepo.findMatchingJobs(profile, limit, skip);

  // Calculate match percentage for each job
  const jobsWithMatch = jobs.map((job) => ({
    ...job,
    matchPercentage: calculateMatchPercentage(profile, job),
  }));

  // Sort by match percentage
  jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return jobsWithMatch;
};

export const getJobStats = async (employerId) => {
  return jobRepo.getJobStats(employerId);
};

export const getTotalJobsCount = async (filters = {}) => {
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

  return jobRepo.getTotalJobsCount(query);
};

// Helper function to calculate match percentage
const calculateMatchPercentage = (profile, job) => {
  let score = 0;
  let maxScore = 0;

  // Skill match (60% weight)
  if (profile.skills && profile.skills.length > 0 && job.requiredSkills) {
    const skillMatches = profile.skills.filter((skill) =>
      job.requiredSkills.some((req) => req.toLowerCase() === skill.toLowerCase())
    ).length;
    const skillScore = (skillMatches / job.requiredSkills.length) * 60;
    score += skillScore;
  }
  maxScore += 60;

  // Location match (15% weight)
  if (profile.preferredLocations && profile.preferredLocations.length > 0) {
    const locationMatch = profile.preferredLocations.some(
      (loc) => loc.toLowerCase() === job.location?.toLowerCase()
    );
    if (locationMatch) score += 15;
  }
  maxScore += 15;

  // Salary match (15% weight)
  if (profile.salaryExpectation?.min && job.salary?.max) {
    if (job.salary.max >= profile.salaryExpectation.min) {
      score += 15;
    }
  }
  maxScore += 15;

  // Job type match (10% weight)
  if (profile.jobTypes && profile.jobTypes.length > 0) {
    const typeMatch = profile.jobTypes.some(
      (type) => type.toLowerCase() === job.jobType?.toLowerCase()
    );
    if (typeMatch) score += 10;
  }
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
};
