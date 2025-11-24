import express from "express";
import notificationController from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread/count", notificationController.getUnreadCount);

// Get notification statistics
router.get("/stats", notificationController.getStats);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllAsRead);

// Delete all notifications
router.delete("/all", notificationController.deleteAllNotifications);

// Delete all read notifications
router.delete("/read", notificationController.deleteAllRead);

// Mark notification as read
router.put("/:id/read", notificationController.markAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

export default router;
