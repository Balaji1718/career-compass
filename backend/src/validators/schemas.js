'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');
const {
  USER_SKILL_SOURCES,
  EXPERIENCE_LEVELS,
} = require('../config/constants');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), 'Not a valid identifier.');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .refine((v) => /[a-zA-Z]/.test(v), 'Password must contain a letter.')
  .refine((v) => /[0-9]/.test(v), 'Password must contain a number.');

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name.').max(120),
    email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
    password,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.confirmPassword === data.password,
    { path: ['confirmPassword'], message: 'Passwords do not match.' }
  );

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
  password: z.string().min(1, 'Please enter your password.'),
});

const educationSchema = z.object({
  degree: z.string().trim().max(160).default(''),
  field: z.string().trim().max(160).default(''),
  institution: z.string().trim().max(200).default(''),
  graduationYear: z.coerce.number().int().min(1950).max(2100).optional(),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(40).default(''),
  location: z.string().trim().max(160).default(''),
  education: z.array(educationSchema).max(10).default([]),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).default('student'),
  yearsOfExperience: z.coerce.number().min(0).max(60).default(0),
  interests: z.array(z.string().trim().max(80)).max(30).default([]),
  preferredCareerIds: z.array(objectId).max(20).default([]),
  preferredDomains: z.array(z.string().trim().max(80)).max(20).default([]),
  careerGoal: z.string().trim().max(500).default(''),
  bio: z.string().trim().max(1000).default(''),
});

const userSkillCreateSchema = z.object({
  skillId: objectId,
  proficiencyLevel: z.coerce.number().int().min(1).max(4),
  source: z.enum(USER_SKILL_SOURCES).default('manual'),
  yearsOfExperience: z.coerce.number().min(0).max(60).default(0),
  evidence: z.array(z.string().max(300)).max(10).default([]),
  verified: z.boolean().default(true),
});

const userSkillUpdateSchema = z.object({
  proficiencyLevel: z.coerce.number().int().min(1).max(4).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(60).optional(),
  verified: z.boolean().optional(),
});

const analysisCreateSchema = z.object({
  careerId: objectId,
});

const roadmapCreateSchema = z.object({
  analysisId: objectId,
  maxStages: z.coerce.number().int().min(1).max(15).default(8),
});

const roadmapUpdateSchema = z.object({
  stages: z
    .array(
      z.object({
        stageNumber: z.coerce.number().int().min(1),
        completed: z.boolean(),
      })
    )
    .min(1)
    .max(15),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  skillId: objectId.optional(),
});

module.exports = {
  objectId,
  registerSchema,
  loginSchema,
  profileSchema,
  userSkillCreateSchema,
  userSkillUpdateSchema,
  analysisCreateSchema,
  roadmapCreateSchema,
  roadmapUpdateSchema,
  listQuerySchema,
};
