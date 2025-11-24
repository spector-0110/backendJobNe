import * as messageRepository from "../repositories/message.repository.js";
import * as connectionRepository from "../repositories/connection.repository.js";
import * as userRepository from "../repositories/user.repository.js";

class MessageService {
  /**
   * Send a message
   * @param {string} senderId - User sending the message
   * @param {string} receiverId - User receiving the message
   * @param {string} content - Message content
   * @returns {Object} - Created message
   */
  async sendMessage(senderId, receiverId, content) {
    // Cannot message yourself
    if (senderId === receiverId) {
      throw { status: 400, message: "Cannot send message to yourself" };
    }

    // Verify receiver exists
    const receiver = await userRepository.getUserById(receiverId);
    if (!receiver) {
      throw { status: 404, message: "Receiver not found" };
    }

    // Check if users are connected
    const connection = await connectionRepository.getConnectionBetweenUsers(
      senderId,
      receiverId
    );

    if (!connection || connection.status !== "accepted") {
      throw {
        status: 403,
        message: "You must be connected to send messages",
        code: "NOT_CONNECTED",
      };
    }

    // Create message
    const messageData = {
      senderId,
      receiverId,
      content,
      isRead: false,
    };

    const message = await messageRepository.createMessage(messageData);

    // Get populated message
    const populatedMessage = await messageRepository.getMessageById(
      message._id
    );

    // Emit real-time message to receiver via Socket.IO
    if (io) {
      io.to(`user_${receiverId}`).emit("new_message", {
        message: populatedMessage,
      });

      // Also emit to sender for multi-device sync
      io.to(`user_${senderId}`).emit("message_sent", {
        message: populatedMessage,
      });
    }

    return populatedMessage;
  }

  /**
   * Get conversations for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Pagination
   * @returns {Object} - List of conversations with last message
   */
  async getConversations(userId, filters = {}) {
    const { page = 1, limit = 20 } = filters;

    // Get all connections (accepted only)
    const connections = await connectionRepository.getConnectionsByUser(
      userId,
      { status: "accepted", page: 1, limit: 1000 }
    );

    if (connections.length === 0) {
      return {
        conversations: [],
        count: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      };
    }

    // Get all user IDs this user is connected with
    const connectedUserIds = connections.map((conn) => {
      const isReceiver = conn.receiverId._id.toString() === userId;
      return isReceiver
        ? conn.senderId._id.toString()
        : conn.receiverId._id.toString();
    });

    // Get conversations with last message for each connected user
    const conversations = [];

    for (const otherUserId of connectedUserIds) {
      // Get last message between these two users
      const messages = await messageRepository.getMessagesBetweenUsers(
        userId,
        otherUserId,
        { page: 1, limit: 1 }
      );

      const lastMessage = messages[0] || null;

      // Get unread count
      const unreadCount = await messageRepository.countUnreadMessages(
        userId,
        otherUserId
      );

      // Get other user details
      const otherUser = await userRepository.getUserById(otherUserId);

      if (otherUser) {
        conversations.push({
          userId: otherUser._id,
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            role: otherUser.role,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: lastMessage.senderId._id,
                createdAt: lastMessage.createdAt,
                isRead: lastMessage.isRead,
              }
            : null,
          unreadCount,
          lastActivity: lastMessage ? lastMessage.createdAt : null,
        });
      }
    }

    // Sort by last activity (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedConversations = conversations.slice(startIndex, endIndex);

    return {
      conversations: paginatedConversations,
      count: paginatedConversations.length,
      totalCount: conversations.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(conversations.length / limit),
    };
  }

  /**
   * Get messages between two users
   * @param {string} userId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @param {Object} filters - Pagination
   * @returns {Object} - List of messages
   */
  async getMessagesBetweenUsers(userId, otherUserId, filters = {}) {
    // Verify users are connected
    const connection = await connectionRepository.getConnectionBetweenUsers(
      userId,
      otherUserId
    );

    if (!connection || connection.status !== "accepted") {
      throw {
        status: 403,
        message: "You must be connected to view messages",
      };
    }

    const { page = 1, limit = 50 } = filters;

    const messages = await messageRepository.getMessagesBetweenUsers(
      userId,
      otherUserId,
      { page, limit }
    );

    // Mark messages as read where current user is receiver
    const unreadMessageIds = messages
      .filter(
        (msg) =>
          msg.receiverId._id.toString() === userId && msg.isRead === false
      )
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      await Promise.all(
        unreadMessageIds.map((msgId) =>
          messageRepository.markMessageAsRead(msgId)
        )
      );

      // Emit read receipts to sender
      if (io) {
        io.to(`user_${otherUserId}`).emit("messages_read", {
          messageIds: unreadMessageIds,
          readBy: userId,
        });
      }
    }

    const totalCount = await messageRepository.countMessagesBetweenUsers(
      userId,
      otherUserId
    );

    return {
      messages,
      count: messages.length,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Mark message as read
   * @param {string} userId - User marking as read (must be receiver)
   * @param {string} messageId - Message ID
   * @returns {Object} - Updated message
   */
  async markMessageAsRead(userId, messageId) {
    const message = await messageRepository.getMessageById(messageId);

    if (!message) {
      throw { status: 404, message: "Message not found" };
    }

    // Verify user is the receiver
    if (message.receiverId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to mark this message as read",
      };
    }

    if (message.isRead) {
      return message; // Already read
    }

    const updatedMessage = await messageRepository.markMessageAsRead(messageId);

    // Emit read receipt to sender
    if (io) {
      io.to(`user_${message.senderId._id}`).emit("message_read", {
        messageId: updatedMessage._id,
        readBy: userId,
        readAt: updatedMessage.updatedAt,
      });
    }

    return updatedMessage;
  }

  /**
   * Mark all messages from a user as read
   * @param {string} userId - Current user ID (receiver)
   * @param {string} senderId - Sender user ID
   * @returns {Object} - Update result
   */
  async markAllMessagesAsRead(userId, senderId) {
    // Verify connection
    const connection = await connectionRepository.getConnectionBetweenUsers(
      userId,
      senderId
    );

    if (!connection || connection.status !== "accepted") {
      throw { status: 403, message: "Not connected with this user" };
    }

    const result = await messageRepository.markAllMessagesAsRead(
      userId,
      senderId
    );

    // Emit read receipts to sender
    if (io && result.modifiedCount > 0) {
      io.to(`user_${senderId}`).emit("messages_read", {
        readBy: userId,
        conversationWith: userId,
      });
    }

    return {
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Delete a message
   * @param {string} userId - User deleting the message
   * @param {string} messageId - Message ID
   * @returns {Object} - Success message
   */
  async deleteMessage(userId, messageId) {
    const message = await messageRepository.getMessageById(messageId);

    if (!message) {
      throw { status: 404, message: "Message not found" };
    }

    // Only sender can delete their message
    if (message.senderId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You can only delete your own messages",
      };
    }

    await messageRepository.deleteMessage(messageId);

    // Emit message deletion to receiver
    if (io) {
      io.to(`user_${message.receiverId._id}`).emit("message_deleted", {
        messageId,
        conversationWith: userId,
      });
    }

    return { message: "Message deleted successfully" };
  }

  /**
   * Get unread message count
   * @param {string} userId - User ID
   * @returns {Object} - Unread count
   */
  async getUnreadCount(userId) {
    const count = await messageRepository.countUnreadMessages(userId);

    return { unreadCount: count };
  }

  /**
   * Search messages
   * @param {string} userId - User ID
   * @param {string} searchText - Search text
   * @param {Object} filters - Pagination
   * @returns {Object} - Search results
   */
  async searchMessages(userId, searchText, filters = {}) {
    const { page = 1, limit = 20 } = filters;

    if (!searchText || searchText.trim().length === 0) {
      throw { status: 400, message: "Search text is required" };
    }

    const messages = await messageRepository.searchMessages(userId, searchText, {
      page,
      limit,
    });

    return {
      messages,
      count: messages.length,
      page: parseInt(page),
      limit: parseInt(limit),
      searchText,
    };
  }
}

export default new MessageService();
