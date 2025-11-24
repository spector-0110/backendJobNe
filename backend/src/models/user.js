import mongoose from "mongoose";

/**
 * USER MODEL (RBAC)
 * ------------------------------------------------------------
 * Single unified user table for authentication.
 * Roles:
 *  - jobseeker
 *  - employer
 *  - admin
 *
 * Profiles are stored separately:
 *  - JobSeekerProfile (jobseeker)
 *  - EmployerProfile (employer)
 */

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "employer", "jobseeker"],
      required: true,
      index: true,
    },

    // Soft deletion or ban mechanism
    isActive: {
      type: Boolean,
      default: true,
    },

    // Links to profile tables
    jobSeekerProfileId: { type: mongoose.Types.ObjectId, ref: "JobSeekerProfile" },
    employerProfileId: { type: mongoose.Types.ObjectId, ref: "EmployerProfile" },

    // For future: 2FA, device tracking, lastLogin metadata
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);