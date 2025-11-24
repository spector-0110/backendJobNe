import connectionService from "../services/connection.service.js";
import { success } from "../utils/response.util.js";

class ConnectionController {
  /**
   * Send connection request
   * POST /api/connections/request
   */
  async sendConnectionRequest(req, res, next) {
    try {
      const senderId = req.user.userId;
      const { receiverId, message } = req.body;

      const connection = await connectionService.sendConnectionRequest(
        senderId,
        receiverId,
        message
      );

      return success(
        res,
        connection,
        "Connection request sent successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept connection request
   * PUT /api/connections/:id/accept
   */
  async acceptConnectionRequest(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const connection = await connectionService.acceptConnectionRequest(
        userId,
        id
      );

      return success(
        res,
        connection,
        "Connection request accepted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject connection request
   * PUT /api/connections/:id/reject
   */
  async rejectConnectionRequest(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const connection = await connectionService.rejectConnectionRequest(
        userId,
        id
      );

      return success(
        res,
        connection,
        "Connection request rejected"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove connection
   * DELETE /api/connections/:id
   */
  async removeConnection(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const result = await connectionService.removeConnection(userId, id);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Block user
   * POST /api/connections/block
   */
  async blockUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const { targetUserId } = req.body;

      const connection = await connectionService.blockUser(
        userId,
        targetUserId
      );

      return success(res, connection, "User blocked successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unblock user
   * PUT /api/connections/:id/unblock
   */
  async unblockUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const result = await connectionService.unblockUser(userId, id);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my connections
   * GET /api/connections/my
   */
  async getMyConnections(req, res, next) {
    try {
      const userId = req.user.userId;
      const { status, page, limit } = req.query;

      const result = await connectionService.getMyConnections(userId, {
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
   * Get pending requests (received)
   * GET /api/connections/requests/pending
   */
  async getPendingRequests(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await connectionService.getPendingRequests(userId, {
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sent requests
   * GET /api/connections/requests/sent
   */
  async getSentRequests(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await connectionService.getSentRequests(userId, {
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get blocked users
   * GET /api/connections/blocked
   */
  async getBlockedUsers(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await connectionService.getBlockedUsers(userId, {
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get connection statistics
   * GET /api/connections/stats
   */
  async getConnectionStats(req, res, next) {
    try {
      const userId = req.user.userId;

      const stats = await connectionService.getConnectionStats(userId);

      return success(res, { stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConnectionController();
