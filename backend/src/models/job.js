import mongoose from "mongoose";

/**
 * JOB MODEL
 * ------------------------------------------------------------
 * Core of the JobNest platform.
 */

const JobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Types.ObjectId,
      ref: "User", // employer user
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    requiredSkills: {
      type: [String],
      required: true,
      index: true,
    },

    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" },
    },

    location: { type: String, index: true },
    experienceLevel: { type: String },
    jobType: { type: String },

    isActive: { type: Boolean, default: true },

    searchableText: {
      type: String,
      index: "text",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);