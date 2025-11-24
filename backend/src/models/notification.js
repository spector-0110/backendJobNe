import mongoose from "mongoose";

/**
 * NOTIFICATION MODEL
 * ------------------------------------------------------------
 * Stores notifications for both employers and job seekers.
 */

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "new_message",
        "connection_request",
        "connection_accept",
        "job_match",
        "application_status",
      ],
      required: true,
    },

    title: String,
    message: String,

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);