import mongoose from "mongoose";

/**
 * ASSESSMENT MODEL
 * ------------------------------------------------------------
 * Stores personality questions + user responses + score.
 */

const AssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    questions: [
      {
        questionText: String,
        options: [String],
      },
    ],

    answers: [
      {
        questionId: String,
        selectedOption: String,
      },
    ],

    score: { type: Number },
    reportFileId: mongoose.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", AssessmentSchema);