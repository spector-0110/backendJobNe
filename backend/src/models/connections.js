import mongoose from "mongoose";

/**
 * CONNECTION MODEL
 * ------------------------------------------------------------
 * Supports LinkedIn-like connection requests.
 */

const ConnectionSchema = new mongoose.Schema(
  {
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

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests
ConnectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.model("Connection", ConnectionSchema);