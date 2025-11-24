// src/validators/jobseeker.validator.js
import Joi from "joi";

/**
 * Job Seeker Profile Validators
 */

export const createProfileSchema = Joi.object({
  headline: Joi.string().min(5).max(200).optional(),
  about: Joi.string().max(2000).optional(),
  skills: Joi.array().items(Joi.string()).min(1).max(50).optional(),
  experienceYears: Joi.number().min(0).max(50).optional(),
  preferredLocations: Joi.array().items(Joi.string()).max(20).optional(),
  salaryExpectation: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(0).required(),
    currency: Joi.string().valid("USD", "INR", "EUR", "GBP").default("INR"),
  }).optional(),
  jobTypes: Joi.array()
    .items(Joi.string().valid("remote", "onsite", "hybrid", "contract", "fulltime", "parttime"))
    .optional(),
});

export const updateProfileSchema = Joi.object({
  headline: Joi.string().min(5).max(200).optional(),
  about: Joi.string().max(2000).optional(),
  skills: Joi.array().items(Joi.string()).min(1).max(50).optional(),
  experienceYears: Joi.number().min(0).max(50).optional(),
  preferredLocations: Joi.array().items(Joi.string()).max(20).optional(),
  salaryExpectation: Joi.object({
    min: Joi.number().min(0).optional(),
    max: Joi.number().min(0).optional(),
    currency: Joi.string().valid("USD", "INR", "EUR", "GBP").optional(),
  }).optional(),
  jobTypes: Joi.array()
    .items(Joi.string().valid("remote", "onsite", "hybrid", "contract", "fulltime", "parttime"))
    .optional(),
});

export const searchSchema = Joi.object({
  skills: Joi.string().optional(),
  experienceYears: Joi.number().min(0).optional(),
  locations: Joi.string().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});
