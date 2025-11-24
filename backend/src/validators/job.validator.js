// src/validators/job.validator.js
import Joi from "joi";

/**
 * Job Validators
 */

export const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(50).max(5000).required(),
  requiredSkills: Joi.array().items(Joi.string()).min(1).max(50).required(),
  salary: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(0).required(),
    currency: Joi.string().valid("USD", "INR", "EUR", "GBP").default("INR"),
  }).optional(),
  location: Joi.string().max(200).optional(),
  experienceLevel: Joi.string()
    .valid("entry", "junior", "mid", "senior", "lead", "executive")
    .optional(),
  jobType: Joi.string()
    .valid("remote", "onsite", "hybrid", "contract", "fulltime", "parttime")
    .optional(),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(50).max(5000).optional(),
  requiredSkills: Joi.array().items(Joi.string()).min(1).max(50).optional(),
  salary: Joi.object({
    min: Joi.number().min(0).optional(),
    max: Joi.number().min(0).optional(),
    currency: Joi.string().valid("USD", "INR", "EUR", "GBP").optional(),
  }).optional(),
  location: Joi.string().max(200).optional(),
  experienceLevel: Joi.string()
    .valid("entry", "junior", "mid", "senior", "lead", "executive")
    .optional(),
  jobType: Joi.string()
    .valid("remote", "onsite", "hybrid", "contract", "fulltime", "parttime")
    .optional(),
  isActive: Joi.boolean().optional(),
});

export const searchJobsSchema = Joi.object({
  skills: Joi.string().optional(),
  location: Joi.string().optional(),
  jobType: Joi.string().optional(),
  experienceLevel: Joi.string().optional(),
  minSalary: Joi.number().min(0).optional(),
  searchText: Joi.string().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});
