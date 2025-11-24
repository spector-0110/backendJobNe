import * as notificationRepository from "../repositories/notification.repository.js";

class NotificationService {
  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Type, isRead, pagination
   * @returns {Object} - List of notifications
   */
  async getNotifications(userId, filters = {}) {
    const { type, isRead, page = 1, limit = 20 } = filters;

    const query = { userId };
    if (type) {
      query.type = type;
    }
    if (isRead !== undefined) {
      query.isRead = isRead === "true" || isRead === true;
    }

    const notifications = await notificationRepository.getNotificationsByUser(
      userId,
      { type, isRead, page, limit }
    );

    const totalCount = await notificationRepository.countNotifications(query);

    return {
      notifications,
      count: notifications.length,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Object} - Unread count
   */
  async getUnreadCount(userId) {
    const count = await notificationRepository.countUnreadNotifications(userId);

    return { unreadCount: count };
  }

  /**
   * Mark notification as read
   * @param {string} userId - User ID
   * @param {string} notificationId - Notification ID
   * @returns {Object} - Updated notification
   */
  async markAsRead(userId, notificationId) {
    const notification = await notificationRepository.getNotificationById(
      notificationId
    );

    if (!notification) {
      throw { status: 404, message: "Notification not found" };
    }

    // Verify ownership
    if (notification.userId.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to update this notification",
      };
    }

    if (notification.isRead) {
      return notification; // Already read
    }

    const updatedNotification =
      await notificationRepository.markNotificationAsRead(notificationId);

    return updatedNotification;
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Object} - Update result
   */
  async markAllAsRead(userId) {
    const result = await notificationRepository.markAllNotificationsAsRead(
      userId
    );

    return {
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Delete a notification
   * @param {string} userId - User ID
   * @param {string} notificationId - Notification ID
   * @returns {Object} - Success message
   */
  async deleteNotification(userId, notificationId) {
    const notification = await notificationRepository.getNotificationById(
      notificationId
    );

    if (!notification) {
      throw { status: 404, message: "Notification not found" };
    }

    // Verify ownership
    if (notification.userId.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to delete this notification",
      };
    }

    await notificationRepository.deleteNotification(notificationId);

    return { message: "Notification deleted successfully" };
  }

  /**
   * Delete all read notifications
   * @param {string} userId - User ID
   * @returns {Object} - Delete result
   */
  async deleteAllRead(userId) {
    const result = await notificationRepository.deleteReadNotifications(userId);

    return {
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Delete all notifications for a user
   * @param {string} userId - User ID
   * @returns {Object} - Delete result
   */
  async deleteAllNotifications(userId) {
    const result = await notificationRepository.deleteAllNotifications(userId);

    return {
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Get notification statistics by type
   * @param {string} userId - User ID
   * @returns {Object} - Statistics
   */
  async getNotificationStats(userId) {
    const stats = await notificationRepository.getNotificationStatsByUser(
      userId
    );

    const formattedStats = {
      total: 0,
      unread: 0,
      byType: {},
    };

    stats.forEach((stat) => {
      formattedStats.byType[stat._id] = {
        total: stat.total,
        unread: stat.unread,
      };
      formattedStats.total += stat.total;
      formattedStats.unread += stat.unread;
    });

    return formattedStats;
  }
}

export default new NotificationService();
