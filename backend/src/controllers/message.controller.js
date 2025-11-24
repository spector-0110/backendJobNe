import messageService from "../services/message.service.js";
import { success } from "../utils/response.util.js";

class MessageController {
  /**
   * Send a message
   * POST /api/messages/send
   */
  async sendMessage(req, res, next) {
    try {
      const senderId = req.user.userId;
      const { receiverId, content } = req.body;

      const message = await messageService.sendMessage(
        senderId,
        receiverId,
        content
      );

      return success(res, message, "Message sent successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversations
   * GET /api/messages/conversations
   */
  async getConversations(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const result = await messageService.getConversations(userId, {
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages with a specific user
   * GET /api/messages/:userId
   */
  async getMessages(req, res, next) {
    try {
      const userId = req.user.userId;
      const { userId: otherUserId } = req.params;
      const { page, limit } = req.query;

      const result = await messageService.getMessagesBetweenUsers(
        userId,
        otherUserId,
        { page, limit }
      );

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark message as read
   * PUT /api/messages/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const message = await messageService.markMessageAsRead(userId, id);

      return success(res, message, "Message marked as read");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all messages from a user as read
   * PUT /api/messages/read-all/:userId
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      const { userId: senderId } = req.params;

      const result = await messageService.markAllMessagesAsRead(
        userId,
        senderId
      );

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a message
   * DELETE /api/messages/:id
   */
  async deleteMessage(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const result = await messageService.deleteMessage(userId, id);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread message count
   * GET /api/messages/unread/count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.userId;

      const result = await messageService.getUnreadCount(userId);

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search messages
   * GET /api/messages/search
   */
  async searchMessages(req, res, next) {
    try {
      const userId = req.user.userId;
      const { q, page, limit } = req.query;

      const result = await messageService.searchMessages(userId, q, {
        page,
        limit,
      });

      return success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
