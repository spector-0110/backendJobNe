// src/repositories/notification.repository.js
import Notification from "../models/notification.js";

/**
 * Notification Repository
 */

export const createNotification = async (payload) => {
  return Notification.create(payload);
};

export const findNotificationById = async (id) => {
  return Notification.findById(id).lean();
};

export const findUserNotifications = async (userId, limit = 50, skip = 0) => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const findUnreadNotifications = async (userId, limit = 20) => {
  return Notification.find({ userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const markNotificationAsRead = async (id) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

export const deleteNotification = async (id, userId) => {
  return Notification.findOneAndDelete({ _id: id, userId });
};

export const deleteAllNotifications = async (userId) => {
  return Notification.deleteMany({ userId });
};

export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};

export const getNotificationsByType = async (userId, type, limit = 20, skip = 0) => {
  return Notification.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const deleteOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
  });
};
