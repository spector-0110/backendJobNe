import applicationService from "../services/application.service.js";
import { success } from "../utils/response.util.js";

class ApplicationController {
  /**
   * Apply for a job
   * POST /api/applications/apply
   */
  async applyForJob(req, res, next) {
    try {
      const userId = req.user.userId;
      const { jobId, coverLetter } = req.body;

      const application = await applicationService.applyForJob(
        userId,
        jobId,
        coverLetter
      );

      return success(
        res,
        application,
        "Application submitted successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw application
   * PUT /api/applications/:id/withdraw
   */
  async withdrawApplication(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const application = await applicationService.withdrawApplication(
        userId,
        id
      );

      return success(
        res,
        application,
        "Application withdrawn successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update application status (employer)
   * PUT /api/applications/:id/status
   */
  async updateApplicationStatus(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const { status } = req.body;

      const application = await applicationService.updateApplicationStatus(
        userId,
        id,
        status
      );

      return success(
        res,
        application,
        "Application status updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my applications (job seeker)
   * GET /api/applications/my
   */
  async getMyApplications(req, res, next) {
    try {
      const userId = req.user.userId;
      const { status, page, limit } = req.query;

      const result = await applicationService.getMyApplications(userId, {
        status,
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get applications for employer
   * GET /api/applications/employer
   */
  async getApplicationsForEmployer(req, res, next) {
    try {
      const userId = req.user.userId;
      const { jobId, status, page, limit } = req.query;

      const result = await applicationService.getApplicationsForEmployer(
        userId,
        { jobId, status, page, limit }
      );

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get application by ID
   * GET /api/applications/:id
   */
  async getApplicationById(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const application = await applicationService.getApplicationById(
        userId,
        id
      );

      return success(res, application);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get application statistics (job seeker)
   * GET /api/applications/stats/me
   */
  async getApplicationStats(req, res, next) {
    try {
      const userId = req.user.userId;

      const stats = await applicationService.getApplicationStats(userId);

      return success(res, { stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get application statistics (employer)
   * GET /api/applications/stats/employer
   */
  async getEmployerApplicationStats(req, res, next) {
    try {
      const userId = req.user.userId;
      const { jobId } = req.query;

      const stats = await applicationService.getEmployerApplicationStats(
        userId,
        jobId
      );

      return success(res, { stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete application
   * DELETE /api/applications/:id
   */
  async deleteApplication(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const result = await applicationService.deleteApplication(userId, id);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ApplicationController();