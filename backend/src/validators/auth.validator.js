// src/validators/auth.validator.js
import Joi from "joi";

/**
 * Basic request validators for auth endpoints.
 * You can replace Joi with Zod if preferred.
 */

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid("admin", "employer", "jobseeker").required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

