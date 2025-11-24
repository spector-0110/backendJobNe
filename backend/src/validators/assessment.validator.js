// src/validators/assessment.validator.js
import Joi from "joi";

/**
 * Assessment Validators
 */

export const submitAssessmentSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedOption: Joi.string().required(),
      })
    )
    .min(10)
    .required(),
});
