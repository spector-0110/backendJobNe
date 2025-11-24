// src/sockets/socket.handler.js
import { verifyAccessToken } from "../utils/jwt.util.js";

/**
 * Socket.IO Event Handler
 * - Manages real-time connections for messaging and notifications
 * - Handles user presence (online/offline)
 * - Broadcasts events to connected clients
 */

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

/**
 * Main socket handler
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 */
const socketHandler = (socket, io) => {
  console.log(`Client connected: ${socket.id}`);

  // Authentication middleware for socket
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

  if (!token) {
    console.log("Socket connection rejected: No token provided");
    socket.disconnect();
    return;
  }

  let userId;
  try {
    const payload = verifyAccessToken(token);
    userId = payload.userId;
    socket.userId = userId;
  } catch (error) {
    console.log("Socket connection rejected: Invalid token");
    socket.disconnect();
    return;
  }

  // Store connected user
  connectedUsers.set(userId, socket.id);

  // Join user's personal room for targeted notifications
  socket.join(`user:${userId}`);

  // Emit to all connections that user is online
  socket.broadcast.emit("user_online", { userId });

  console.log(`User ${userId} connected with socket ${socket.id}`);

  // ==================== MESSAGE EVENTS ====================

  /**
   * Join a conversation room
   * payload: { conversationId }
   */
  socket.on("join_conversation", ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  /**
   * Leave a conversation room
   * payload: { conversationId }
   */
  socket.on("leave_conversation", ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  /**
   * Send a message
   * payload: { receiverId, conversationId, text, attachmentFileId }
   */
  socket.on("send_message", async (payload) => {
    try {
      const { receiverId, conversationId, text, attachmentFileId } = payload;

      // Create message in database (you'll need to import message service)
      const messageData = {
        senderId: userId,
        receiverId,
        conversationId,
        text,
        attachmentFileId,
        createdAt: new Date(),
      };

      // Emit to receiver if online
      io.to(`user:${receiverId}`).emit("new_message", messageData);

      // Emit back to sender as confirmation
      socket.emit("message_sent", {
        success: true,
        message: messageData,
      });

      console.log(`Message sent from ${userId} to ${receiverId}`);
    } catch (error) {
      socket.emit("message_error", {
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * Typing indicator start
   * payload: { receiverId }
   */
  socket.on("typing_start", ({ receiverId }) => {
    io.to(`user:${receiverId}`).emit("user_typing", {
      userId,
      isTyping: true,
    });
  });

  /**
   * Typing indicator stop
   * payload: { receiverId }
   */
  socket.on("typing_stop", ({ receiverId }) => {
    io.to(`user:${receiverId}`).emit("user_typing", {
      userId,
      isTyping: false,
    });
  });

  /**
   * Mark message as read
   * payload: { messageId, senderId }
   */
  socket.on("mark_read", ({ messageId, senderId }) => {
    // Notify sender that message was read
    io.to(`user:${senderId}`).emit("message_read", {
      messageId,
      readBy: userId,
      readAt: new Date(),
    });
  });

  // ==================== NOTIFICATION EVENTS ====================

  /**
   * Request to get unread notifications count
   */
  socket.on("get_unread_count", async () => {
    try {
      // You'll need to import notification repository
      // const count = await getUnreadCount(userId);
      const count = 0; // Placeholder
      socket.emit("unread_count", { count });
    } catch (error) {
      console.error("Error getting unread count:", error);
    }
  });

  // ==================== CONNECTION EVENTS ====================

  /**
   * Send connection request
   * payload: { receiverId }
   */
  socket.on("send_connection_request", ({ receiverId }) => {
    io.to(`user:${receiverId}`).emit("connection_request", {
      senderId: userId,
      timestamp: new Date(),
    });
  });

  /**
   * Accept connection request
   * payload: { senderId }
   */
  socket.on("accept_connection", ({ senderId }) => {
    io.to(`user:${senderId}`).emit("connection_accepted", {
      acceptedBy: userId,
      timestamp: new Date(),
    });
  });

  // ==================== APPLICATION EVENTS ====================

  /**
   * Notify employer of new application
   * payload: { employerId, jobId, applicationId }
   */
  socket.on("new_application", ({ employerId, jobId, applicationId }) => {
    io.to(`user:${employerId}`).emit("application_received", {
      jobId,
      applicationId,
      applicantId: userId,
      timestamp: new Date(),
    });
  });

  // ==================== PRESENCE EVENTS ====================

  /**
   * Check if user is online
   * payload: { userId }
   */
  socket.on("check_online", ({ userId: targetUserId }) => {
    const isOnline = connectedUsers.has(targetUserId);
    socket.emit("user_online_status", {
      userId: targetUserId,
      isOnline,
    });
  });

  // ==================== DISCONNECT EVENT ====================

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected: ${socket.id}`);
    
    // Remove from connected users
    connectedUsers.delete(userId);

    // Broadcast that user is offline
    socket.broadcast.emit("user_offline", { userId });
  });

  // ==================== ERROR HANDLING ====================

  socket.on("error", (error) => {
    console.error(`Socket error for user ${userId}:`, error);
  });
};

// Export helper function to emit from outside socket context
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToConversation = (io, conversationId, event, data) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

export const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

export default socketHandler;
