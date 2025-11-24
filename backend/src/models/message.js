import mongoose from "mongoose";

/**
 * MESSAGE MODEL
 * ------------------------------------------------------------
 * Real-time chat storage.
 */

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Types.ObjectId,
      index: true,
    },

    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: String,
    attachmentFileId: mongoose.Types.ObjectId,

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);