import express from "express";
import messageController from "../controllers/message.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import { sendMessageSchema } from "../validators/message.validator.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Send message
router.post(
  "/send",
  validateBody(sendMessageSchema),
  messageController.sendMessage
);

// Get conversations list
router.get("/conversations", messageController.getConversations);

// Get unread message count
router.get("/unread/count", messageController.getUnreadCount);

// Search messages
router.get("/search", messageController.searchMessages);

// Mark all messages from a user as read
router.put("/read-all/:userId", messageController.markAllAsRead);

// Get messages with a specific user
router.get("/:userId", messageController.getMessages);

// Mark message as read
router.put("/:id/read", messageController.markAsRead);

// Delete message
router.delete("/:id", messageController.deleteMessage);

export default router;
