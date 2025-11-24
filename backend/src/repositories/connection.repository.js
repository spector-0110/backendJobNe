// src/repositories/connection.repository.js
import Connection from "../models/connections.js";
import mongoose from "mongoose";

/**
 * Connection Repository
 */

export const createConnection = async (senderId, receiverId) => {
  return Connection.create({ senderId, receiverId, status: "pending" });
};

export const findConnectionById = async (id) => {
  return Connection.findById(id)
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .lean();
};

export const findConnectionBetweenUsers = async (userId1, userId2) => {
  return Connection.findOne({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  }).lean();
};

export const updateConnectionStatus = async (id, status) => {
  return Connection.findByIdAndUpdate(id, { status }, { new: true });
};

export const deleteConnection = async (id) => {
  return Connection.findByIdAndDelete(id);
};

export const findUserConnections = async (userId, status = "accepted", limit = 50, skip = 0) => {
  const query = {
    $or: [{ senderId: userId }, { receiverId: userId }],
    status,
  };

  return Connection.find(query)
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const findPendingRequests = async (userId, type = "received", limit = 20, skip = 0) => {
  const query = {
    status: "pending",
  };

  if (type === "received") {
    query.receiverId = userId;
  } else {
    query.senderId = userId;
  }

  return Connection.find(query)
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const areUsersConnected = async (userId1, userId2) => {
  const connection = await Connection.findOne({
    $or: [
      { senderId: userId1, receiverId: userId2, status: "accepted" },
      { senderId: userId2, receiverId: userId1, status: "accepted" },
    ],
  }).lean();

  return !!connection;
};

export const getConnectionStats = async (userId) => {
  const stats = await Connection.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) },
        ],
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return stats;
};

export const countUserConnections = async (userId, status = "accepted") => {
  return Connection.countDocuments({
    $or: [{ senderId: userId }, { receiverId: userId }],
    status,
  });
};
