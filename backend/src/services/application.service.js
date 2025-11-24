import * as applicationRepository from "../repositories/application.repository.js";
import * as jobRepository from "../repositories/job.repository.js";
import * as jobSeekerRepository from "../repositories/jobseeker.repository.js";
import * as employerRepository from "../repositories/employer.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";

class ApplicationService {
  /**
   * Apply for a job
   * @param {string} userId - Job seeker's user ID
   * @param {string} jobId - Job ID
   * @param {string} coverLetter - Cover letter (optional)
   * @returns {Object} - Created application
   */
  async applyForJob(userId, jobId, coverLetter = "") {
    // Verify job exists and is active
    const job = await jobRepository.getJobById(jobId);
    if (!job) {
      throw { status: 404, message: "Job not found" };
    }
    if (!job.isActive) {
      throw { status: 400, message: "This job posting is no longer active" };
    }

    // Get job seeker profile
    const jobSeekerProfile = await jobSeekerRepository.getJobSeekerByUserId(
      userId
    );
    if (!jobSeekerProfile) {
      throw { status: 404, message: "Job seeker profile not found" };
    }

    // Check if already applied (prevent duplicates)
    const existingApplication =
      await applicationRepository.getApplicationByUserAndJob(userId, jobId);
    if (existingApplication) {
      throw {
        status: 400,
        message: "You have already applied for this job",
        code: "DUPLICATE_APPLICATION",
      };
    }

    // Create application
    const applicationData = {
      jobSeekerId: userId,
      jobId: jobId,
      employerId: job.employerId._id || job.employerId,
      status: "applied",
      coverLetter: coverLetter,
    };

    const application = await applicationRepository.createApplication(
      applicationData
    );

    // Populate details
    const populatedApplication = await applicationRepository.getApplicationById(
      application._id
    );

    // Create notification for employer
    const notification = await notificationRepository.createNotification({
      userId: job.employerId._id || job.employerId,
      type: "new_application",
      title: "New Job Application",
      message: `${jobSeekerProfile.fullName} has applied for ${job.title}`,
      relatedId: application._id,
      relatedModel: "Application",
    });

    // Emit real-time notification to employer
    if (io) {
      io.to(`user_${job.employerId._id || job.employerId}`).emit(
        "notification",
        {
          type: "new_application",
          notification,
          application: populatedApplication,
        }
      );
    }

    return populatedApplication;
  }

  /**
   * Withdraw application
   * @param {string} userId - User ID
   * @param {string} applicationId - Application ID
   * @returns {Object} - Updated application
   */
  async withdrawApplication(userId, applicationId) {
    const application = await applicationRepository.getApplicationById(
      applicationId
    );
    if (!application) {
      throw { status: 404, message: "Application not found" };
    }

    // Verify ownership
    if (application.jobSeekerId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to withdraw this application",
      };
    }

    // Cannot withdraw if already accepted or rejected
    if (["accepted", "rejected"].includes(application.status)) {
      throw {
        status: 400,
        message: `Cannot withdraw application with status: ${application.status}`,
      };
    }

    const updatedApplication = await applicationRepository.updateApplication(
      applicationId,
      { status: "withdrawn" }
    );

    return updatedApplication;
  }

  /**
   * Update application status (employer action)
   * @param {string} employerId - Employer user ID
   * @param {string} applicationId - Application ID
   * @param {string} newStatus - New status
   * @returns {Object} - Updated application
   */
  async updateApplicationStatus(employerId, applicationId, newStatus) {
    const application = await applicationRepository.getApplicationById(
      applicationId
    );
    if (!application) {
      throw { status: 404, message: "Application not found" };
    }

    // Verify employer owns the job
    if (application.employerId._id.toString() !== employerId) {
      throw {
        status: 403,
        message: "You are not authorized to update this application",
      };
    }

    // Validate status transitions
    const validStatuses = [
      "applied",
      "viewed",
      "shortlisted",
      "rejected",
      "accepted",
    ];
    if (!validStatuses.includes(newStatus)) {
      throw { status: 400, message: `Invalid status: ${newStatus}` };
    }

    // Cannot update withdrawn applications
    if (application.status === "withdrawn") {
      throw {
        status: 400,
        message: "Cannot update withdrawn application",
      };
    }

    const updatedApplication = await applicationRepository.updateApplication(
      applicationId,
      { status: newStatus }
    );

    // Create notification for job seeker
    const statusMessages = {
      viewed: "Your application has been viewed",
      shortlisted: "Congratulations! You've been shortlisted",
      rejected: "Your application status has been updated",
      accepted: "Congratulations! Your application has been accepted",
    };

    if (statusMessages[newStatus]) {
      const notification = await notificationRepository.createNotification({
        userId: application.jobSeekerId._id,
        type: "application_status",
        title: "Application Update",
        message: `${statusMessages[newStatus]} for ${application.jobId.title}`,
        relatedId: application._id,
        relatedModel: "Application",
      });

      // Emit real-time notification to job seeker
      if (io) {
        io.to(`user_${application.jobSeekerId._id}`).emit("notification", {
          type: "application_status",
          notification,
          application: updatedApplication,
        });
      }
    }

    return updatedApplication;
  }

  /**
   * Get applications for a job seeker
   * @param {string} userId - Job seeker user ID
   * @param {Object} filters - Status, pagination
   * @returns {Object} - Applications list
   */
  async getMyApplications(userId, filters = {}) {
    const { status, page = 1, limit = 20 } = filters;

    const query = { jobSeekerId: userId };
    if (status) {
      query.status = status;
    }

    const applications =
      await applicationRepository.getApplicationsByJobSeeker(userId, {
        status,
        page,
        limit,
      });

    const count = await applicationRepository.countApplications(query);

    return {
      applications,
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get applications for an employer's job
   * @param {string} employerId - Employer user ID
   * @param {string} jobId - Job ID (optional)
   * @param {Object} filters - Status, pagination
   * @returns {Object} - Applications list
   */
  async getApplicationsForEmployer(employerId, filters = {}) {
    const { jobId, status, page = 1, limit = 20 } = filters;

    // Verify employer profile exists
    const employerProfile = await employerRepository.getEmployerByUserId(
      employerId
    );
    if (!employerProfile) {
      throw { status: 404, message: "Employer profile not found" };
    }

    // If jobId provided, verify employer owns it
    if (jobId) {
      const job = await jobRepository.getJobById(jobId);
      if (!job) {
        throw { status: 404, message: "Job not found" };
      }
      if (job.employerId._id.toString() !== employerId) {
        throw {
          status: 403,
          message: "You are not authorized to view applications for this job",
        };
      }
    }

    const query = { employerId };
    if (jobId) {
      query.jobId = jobId;
    }
    if (status) {
      query.status = status;
    }

    const applications = await applicationRepository.getApplicationsByEmployer(
      employerId,
      { jobId, status, page, limit }
    );

    const count = await applicationRepository.countApplications(query);

    return {
      applications,
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get application by ID
   * @param {string} userId - User ID (job seeker or employer)
   * @param {string} applicationId - Application ID
   * @returns {Object} - Application details
   */
  async getApplicationById(userId, applicationId) {
    const application = await applicationRepository.getApplicationById(
      applicationId
    );
    if (!application) {
      throw { status: 404, message: "Application not found" };
    }

    // Verify user is either the job seeker or employer
    const isJobSeeker =
      application.jobSeekerId._id.toString() === userId;
    const isEmployer = application.employerId._id.toString() === userId;

    if (!isJobSeeker && !isEmployer) {
      throw {
        status: 403,
        message: "You are not authorized to view this application",
      };
    }

    // If employer is viewing for first time, mark as viewed
    if (isEmployer && application.status === "applied") {
      await applicationRepository.updateApplication(applicationId, {
        status: "viewed",
      });
      application.status = "viewed";
    }

    return application;
  }

  /**
   * Get application statistics for job seeker
   * @param {string} userId - Job seeker user ID
   * @returns {Object} - Statistics
   */
  async getApplicationStats(userId) {
    const stats = await applicationRepository.getApplicationStatsByJobSeeker(
      userId
    );

    // Format stats
    const formattedStats = {
      total: 0,
      applied: 0,
      viewed: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    return formattedStats;
  }

  /**
   * Get application statistics for employer
   * @param {string} employerId - Employer user ID
   * @param {string} jobId - Job ID (optional)
   * @returns {Object} - Statistics
   */
  async getEmployerApplicationStats(employerId, jobId = null) {
    const stats = await applicationRepository.getApplicationStatsByEmployer(
      employerId,
      jobId
    );

    // Format stats
    const formattedStats = {
      total: 0,
      applied: 0,
      viewed: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    return formattedStats;
  }

  /**
   * Delete application (admin or user)
   * @param {string} userId - User ID
   * @param {string} applicationId - Application ID
   * @returns {Object} - Success message
   */
  async deleteApplication(userId, applicationId) {
    const application = await applicationRepository.getApplicationById(
      applicationId
    );
    if (!application) {
      throw { status: 404, message: "Application not found" };
    }

    // Only job seeker can delete their own withdrawn/rejected applications
    if (application.jobSeekerId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to delete this application",
      };
    }

    if (!["withdrawn", "rejected"].includes(application.status)) {
      throw {
        status: 400,
        message: "Can only delete withdrawn or rejected applications",
      };
    }

    await applicationRepository.deleteApplication(applicationId);

    return { message: "Application deleted successfully" };
  }
}

export default new ApplicationService();
