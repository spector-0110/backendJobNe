import notificationService from "../services/notification.service.js";
import { success } from "../utils/response.util.js";

class NotificationController {
  /**
   * Get notifications
   * GET /api/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId;
      const { type, isRead, page, limit } = req.query;

      const result = await notificationService.getNotifications(userId, {
        type,
        isRead,
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread/count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.getUnreadCount(userId);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(userId, id);

      return success(
        res,
        notification,
        "Notification marked as read"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.markAllAsRead(userId);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const result = await notificationService.deleteNotification(userId, id);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all read notifications
   * DELETE /api/notifications/read
   */
  async deleteAllRead(req, res, next) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.deleteAllRead(userId);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all notifications
   * DELETE /api/notifications/all
   */
  async deleteAllNotifications(req, res, next) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.deleteAllNotifications(userId);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification statistics
   * GET /api/notifications/stats
   */
  async getStats(req, res, next) {
    try {
      const userId = req.user.userId;

      const stats = await notificationService.getNotificationStats(userId);

      return success(res, { stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
