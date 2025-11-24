import mongoose from "mongoose";

/**
 * EMPLOYER PROFILE
 * ------------------------------------------------------------
 * Contains branding, culture, and company information.
 */

const EmployerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyDescription: { type: String, trim: true },
    companySize: { type: String },
    industry: { type: String },
    headquartersLocation: { type: String },

    companyValues: [String],

    logoFileId: mongoose.Types.ObjectId,
    officeImages: [mongoose.Types.ObjectId],

    usualHiringRoles: [String],
    skillCategories: [String],

    isVerified: { type: Boolean, default: false }, // for admin approval
  },
  { timestamps: true }
);

export default mongoose.model("EmployerProfile", EmployerProfileSchema);