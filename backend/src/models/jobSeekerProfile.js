import mongoose from "mongoose";

/**
 * JOB SEEKER PROFILE
 * ------------------------------------------------------------
 * Contains detailed profile information for job seekers.
 */

const JobSeekerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },

    headline: { type: String, trim: true },
    about: { type: String, trim: true },

    skills: {
      type: [String],
      default: [],
      index: true, // improves matching
    },

    experienceYears: { type: Number, default: 0 },

    preferredLocations: { type: [String], default: [] },

    salaryExpectation: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" },
    },

    jobTypes: [String], // remote, onsite, hybrid, etc.

    resumeFileId: mongoose.Types.ObjectId,
    coverLetterFileId: mongoose.Types.ObjectId,
    profilePhotoId: mongoose.Types.ObjectId,

    personalityReportId: mongoose.Types.ObjectId,
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("JobSeekerProfile", JobSeekerProfileSchema);