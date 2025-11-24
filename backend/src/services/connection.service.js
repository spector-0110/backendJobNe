import * as connectionRepository from "../repositories/connection.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";

class ConnectionService {
  /**
   * Send connection request
   * @param {string} senderId - User sending the request
   * @param {string} receiverId - User receiving the request
   * @param {string} message - Optional message
   * @returns {Object} - Created connection
   */
  async sendConnectionRequest(senderId, receiverId, message = "") {
    // Cannot connect to self
    if (senderId === receiverId) {
      throw {
        status: 400,
        message: "Cannot send connection request to yourself",
      };
    }

    // Verify receiver exists
    const receiver = await userRepository.getUserById(receiverId);
    if (!receiver) {
      throw { status: 404, message: "User not found" };
    }

    // Check if connection already exists (any status)
    const existingConnection =
      await connectionRepository.getConnectionBetweenUsers(
        senderId,
        receiverId
      );

    if (existingConnection) {
      if (existingConnection.status === "accepted") {
        throw {
          status: 400,
          message: "You are already connected with this user",
        };
      }
      if (existingConnection.status === "pending") {
        throw {
          status: 400,
          message: "Connection request already sent",
        };
      }
      if (existingConnection.status === "blocked") {
        throw {
          status: 403,
          message: "Cannot send connection request to this user",
        };
      }
      if (existingConnection.status === "rejected") {
        // Allow resending after rejection - update existing connection
        const updatedConnection =
          await connectionRepository.updateConnection(existingConnection._id, {
            status: "pending",
            message,
            createdAt: new Date(),
          });

        // Create notification
        await this._createConnectionNotification(
          receiverId,
          senderId,
          "connection_request",
          updatedConnection
        );

        return await connectionRepository.getConnectionById(
          updatedConnection._id
        );
      }
    }

    // Create new connection request
    const connectionData = {
      senderId,
      receiverId,
      status: "pending",
      message,
    };

    const connection = await connectionRepository.createConnection(
      connectionData
    );

    // Get populated connection
    const populatedConnection = await connectionRepository.getConnectionById(
      connection._id
    );

    // Create notification for receiver
    await this._createConnectionNotification(
      receiverId,
      senderId,
      "connection_request",
      populatedConnection
    );

    return populatedConnection;
  }

  /**
   * Accept connection request
   * @param {string} userId - User accepting the request
   * @param {string} connectionId - Connection ID
   * @returns {Object} - Updated connection
   */
  async acceptConnectionRequest(userId, connectionId) {
    const connection = await connectionRepository.getConnectionById(
      connectionId
    );

    if (!connection) {
      throw { status: 404, message: "Connection request not found" };
    }

    // Verify user is the receiver
    if (connection.receiverId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to accept this connection request",
      };
    }

    // Must be in pending status
    if (connection.status !== "pending") {
      throw {
        status: 400,
        message: `Cannot accept connection with status: ${connection.status}`,
      };
    }

    // Update connection status
    const updatedConnection = await connectionRepository.updateConnection(
      connectionId,
      { status: "accepted" }
    );

    // Create notification for sender
    await this._createConnectionNotification(
      connection.senderId._id,
      userId,
      "connection_accept",
      updatedConnection
    );

    return updatedConnection;
  }

  /**
   * Reject connection request
   * @param {string} userId - User rejecting the request
   * @param {string} connectionId - Connection ID
   * @returns {Object} - Updated connection
   */
  async rejectConnectionRequest(userId, connectionId) {
    const connection = await connectionRepository.getConnectionById(
      connectionId
    );

    if (!connection) {
      throw { status: 404, message: "Connection request not found" };
    }

    // Verify user is the receiver
    if (connection.receiverId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to reject this connection request",
      };
    }

    // Must be in pending status
    if (connection.status !== "pending") {
      throw {
        status: 400,
        message: `Cannot reject connection with status: ${connection.status}`,
      };
    }

    // Update connection status
    const updatedConnection = await connectionRepository.updateConnection(
      connectionId,
      { status: "rejected" }
    );

    return updatedConnection;
  }

  /**
   * Remove/disconnect connection
   * @param {string} userId - User removing the connection
   * @param {string} connectionId - Connection ID
   * @returns {Object} - Success message
   */
  async removeConnection(userId, connectionId) {
    const connection = await connectionRepository.getConnectionById(
      connectionId
    );

    if (!connection) {
      throw { status: 404, message: "Connection not found" };
    }

    // Verify user is part of the connection
    const isSender = connection.senderId._id.toString() === userId;
    const isReceiver = connection.receiverId._id.toString() === userId;

    if (!isSender && !isReceiver) {
      throw {
        status: 403,
        message: "You are not authorized to remove this connection",
      };
    }

    // Can only remove accepted connections
    if (connection.status !== "accepted") {
      throw {
        status: 400,
        message: "Can only remove accepted connections",
      };
    }

    // Delete the connection
    await connectionRepository.deleteConnection(connectionId);

    return { message: "Connection removed successfully" };
  }

  /**
   * Block user
   * @param {string} userId - User blocking
   * @param {string} targetUserId - User to block
   * @returns {Object} - Updated/created connection
   */
  async blockUser(userId, targetUserId) {
    if (userId === targetUserId) {
      throw { status: 400, message: "Cannot block yourself" };
    }

    // Check if connection exists
    const existingConnection =
      await connectionRepository.getConnectionBetweenUsers(userId, targetUserId);

    if (existingConnection) {
      // Update to blocked
      const updatedConnection = await connectionRepository.updateConnection(
        existingConnection._id,
        { status: "blocked" }
      );
      return updatedConnection;
    } else {
      // Create new blocked connection
      const connectionData = {
        senderId: userId,
        receiverId: targetUserId,
        status: "blocked",
      };
      const connection = await connectionRepository.createConnection(
        connectionData
      );
      return await connectionRepository.getConnectionById(connection._id);
    }
  }

  /**
   * Unblock user
   * @param {string} userId - User unblocking
   * @param {string} connectionId - Connection ID
   * @returns {Object} - Success message
   */
  async unblockUser(userId, connectionId) {
    const connection = await connectionRepository.getConnectionById(
      connectionId
    );

    if (!connection) {
      throw { status: 404, message: "Connection not found" };
    }

    // Verify user is the one who blocked
    if (connection.senderId._id.toString() !== userId) {
      throw {
        status: 403,
        message: "You are not authorized to unblock this user",
      };
    }

    if (connection.status !== "blocked") {
      throw { status: 400, message: "User is not blocked" };
    }

    // Delete the blocked connection
    await connectionRepository.deleteConnection(connectionId);

    return { message: "User unblocked successfully" };
  }

  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Status filter, pagination
   * @returns {Object} - Connections list
   */
  async getMyConnections(userId, filters = {}) {
    const { status = "accepted", page = 1, limit = 50 } = filters;

    const connections = await connectionRepository.getConnectionsByUser(
      userId,
      { status, page, limit }
    );

    // Transform to return the "other" user in the connection
    const transformedConnections = connections.map((conn) => {
      const isReceiver = conn.receiverId._id.toString() === userId;
      const otherUser = isReceiver ? conn.senderId : conn.receiverId;

      return {
        _id: conn._id,
        user: otherUser,
        status: conn.status,
        message: conn.message,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
      };
    });

    const count = await connectionRepository.countConnections({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status,
    });

    return {
      connections: transformedConnections,
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get pending connection requests (received)
   * @param {string} userId - User ID
   * @param {Object} filters - Pagination
   * @returns {Object} - Pending requests
   */
  async getPendingRequests(userId, filters = {}) {
    const { page = 1, limit = 20 } = filters;

    const requests =
      await connectionRepository.getPendingConnectionsByReceiver(userId, {
        page,
        limit,
      });

    const count = await connectionRepository.countConnections({
      receiverId: userId,
      status: "pending",
    });

    return {
      requests,
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get sent connection requests
   * @param {string} userId - User ID
   * @param {Object} filters - Pagination
   * @returns {Object} - Sent requests
   */
  async getSentRequests(userId, filters = {}) {
    const { page = 1, limit = 20 } = filters;

    const requests = await connectionRepository.getConnectionsByUser(userId, {
      status: "pending",
      page,
      limit,
    });

    // Filter to only sent requests
    const sentRequests = requests.filter(
      (conn) => conn.senderId._id.toString() === userId
    );

    const count = await connectionRepository.countConnections({
      senderId: userId,
      status: "pending",
    });

    return {
      requests: sentRequests,
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get blocked users
   * @param {string} userId - User ID
   * @param {Object} filters - Pagination
   * @returns {Object} - Blocked users
   */
  async getBlockedUsers(userId, filters = {}) {
    const { page = 1, limit = 20 } = filters;

    const blocked = await connectionRepository.getConnectionsByUser(userId, {
      status: "blocked",
      page,
      limit,
    });

    // Filter to only those blocked by this user
    const blockedByMe = blocked.filter(
      (conn) => conn.senderId._id.toString() === userId
    );

    const count = await connectionRepository.countConnections({
      senderId: userId,
      status: "blocked",
    });

    return {
      blockedUsers: blockedByMe,
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get connection statistics
   * @param {string} userId - User ID
   * @returns {Object} - Connection stats
   */
  async getConnectionStats(userId) {
    const stats = await connectionRepository.getConnectionStatsByUser(userId);

    const formattedStats = {
      total: 0,
      accepted: 0,
      pending: 0,
      blocked: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      if (stat._id === "accepted") {
        formattedStats.total = stat.count;
      }
    });

    return formattedStats;
  }

  /**
   * Helper: Create and emit connection notification
   * @private
   */
  async _createConnectionNotification(
    receiverId,
    senderId,
    type,
    connection
  ) {
    const sender = await userRepository.getUserById(senderId);
    if (!sender) return;

    const messages = {
      connection_request: `${sender.name} sent you a connection request`,
      connection_accept: `${sender.name} accepted your connection request`,
    };

    const titles = {
      connection_request: "New Connection Request",
      connection_accept: "Connection Accepted",
    };

    const notification = await notificationRepository.createNotification({
      userId: receiverId,
      type,
      title: titles[type],
      message: messages[type],
      relatedId: connection._id,
      relatedModel: "Connection",
    });

    // Emit real-time notification
    if (io) {
      io.to(`user_${receiverId}`).emit("notification", {
        type,
        notification,
        connection,
      });
    }

    return notification;
  }
}

export default new ConnectionService();
