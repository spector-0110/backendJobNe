import mongoose from "mongoose";

/**
 * JOB APPLICATION MODEL
 * ------------------------------------------------------------
 * Tracks applications and prevents duplicates.
 */

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    jobSeekerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resumeFileId: mongoose.Types.ObjectId,
    coverLetterFileId: mongoose.Types.ObjectId,

    status: {
      type: String,
      enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "withdrawn"],
      default: "applied",
    },

    customResponse: String,
  },
  { timestamps: true }
);

// Prevent duplicate applications
ApplicationSchema.index({ jobId: 1, jobSeekerId: 1 }, { unique: true });

export default mongoose.model("Application", ApplicationSchema);