// src/validators/employer.validator.js
import Joi from "joi";

/**
 * Employer Profile Validators
 */

export const createProfileSchema = Joi.object({
  companyName: Joi.string().min(2).max(200).required(),
  companyDescription: Joi.string().max(2000).optional(),
  companySize: Joi.string()
    .valid("1-10", "11-50", "51-200", "201-500", "501-1000", "1000+")
    .optional(),
  industry: Joi.string().max(100).optional(),
  headquartersLocation: Joi.string().max(200).optional(),
  companyValues: Joi.array().items(Joi.string()).max(10).optional(),
  usualHiringRoles: Joi.array().items(Joi.string()).max(50).optional(),
  skillCategories: Joi.array().items(Joi.string()).max(30).optional(),
});

export const updateProfileSchema = Joi.object({
  companyName: Joi.string().min(2).max(200).optional(),
  companyDescription: Joi.string().max(2000).optional(),
  companySize: Joi.string()
    .valid("1-10", "11-50", "51-200", "201-500", "501-1000", "1000+")
    .optional(),
  industry: Joi.string().max(100).optional(),
  headquartersLocation: Joi.string().max(200).optional(),
  companyValues: Joi.array().items(Joi.string()).max(10).optional(),
  usualHiringRoles: Joi.array().items(Joi.string()).max(50).optional(),
  skillCategories: Joi.array().items(Joi.string()).max(30).optional(),
});

export const verifySchema = Joi.object({
  isVerified: Joi.boolean().required(),
});

export const searchSchema = Joi.object({
  industry: Joi.string().optional(),
  companySize: Joi.string().optional(),
  location: Joi.string().optional(),
  verified: Joi.string().valid("true", "false").optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});
