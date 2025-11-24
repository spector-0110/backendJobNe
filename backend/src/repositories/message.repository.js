// src/repositories/message.repository.js
import Message from "../models/message.js";
import mongoose from "mongoose";

/**
 * Message Repository
 */

export const createMessage = async (payload) => {
  return Message.create(payload);
};

export const findMessageById = async (id) => {
  return Message.findById(id)
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .lean();
};

export const findConversationMessages = async (userId1, userId2, limit = 50, skip = 0) => {
  const query = {
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  };

  return Message.find(query)
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const markMessagesAsRead = async (senderId, receiverId) => {
  return Message.updateMany(
    { senderId, receiverId, isRead: false },
    { isRead: true }
  );
};

export const markMessageAsRead = async (id) => {
  return Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const findUserConversations = async (userId) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) },
        ],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
            "$receiverId",
            "$senderId",
          ],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiverId", new mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "otherUser",
      },
    },
    {
      $unwind: "$otherUser",
    },
    {
      $project: {
        otherUserId: "$_id",
        otherUserName: "$otherUser.name",
        otherUserEmail: "$otherUser.email",
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { "lastMessage.createdAt": -1 },
    },
  ]);

  return conversations;
};

export const getUnreadMessagesCount = async (userId) => {
  return Message.countDocuments({
    receiverId: userId,
    isRead: false,
  });
};

export const deleteMessage = async (id, userId) => {
  return Message.findOneAndDelete({
    _id: id,
    senderId: userId,
  });
};

export const deleteConversation = async (userId1, userId2) => {
  return Message.deleteMany({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  });
};
