import Joi from "joi";

// Apply for job validation
const applyForJobSchema = Joi.object({
  jobId: Joi.string().required().messages({
    "string.empty": "Job ID is required",
    "any.required": "Job ID is required",
  }),
  coverLetter: Joi.string().max(2000).allow("").optional().messages({
    "string.max": "Cover letter must not exceed 2000 characters",
  }),
});

// Update application status validation (employer)
const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("viewed", "shortlisted", "rejected", "accepted")
    .required()
    .messages({
      "string.empty": "Status is required",
      "any.required": "Status is required",
      "any.only":
        "Status must be one of: viewed, shortlisted, rejected, accepted",
    }),
});

export {
  applyForJobSchema,
  updateApplicationStatusSchema,
};
