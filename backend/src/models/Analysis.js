'use strict';

const mongoose = require('mongoose');
const { ANALYSIS_STATUSES, ALGORITHM_VERSION } = require('../config/constants');

const skillResultSchema = new mongoose.Schema(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: String,
    requiredLevel: Number,
    userLevel: Number,
    importance: Number,
    priority: Number,
    requirementType: String,
    isCore: Boolean,
    skillMatch: Number,
    gap: Number,
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
      index: true,
    },
    careerTitle: String,
    overallMatchScore: { type: Number, default: 0 },
    matchClassification: { type: String, default: 'Low Match' },
    skillCoverage: { type: Number, default: 0 },
    matchedSkills: { type: [skillResultSchema], default: [] },
    weakSkills: { type: [skillResultSchema], default: [] },
    missingSkills: { type: [skillResultSchema], default: [] },
    strengths: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    aiSummary: { type: String, default: '' },
    aiMetadata: {
      provider: String,
      model: String,
      generatedAt: Date,
      available: { type: Boolean, default: false },
      reason: String,
    },
    algorithmVersion: { type: String, default: ALGORITHM_VERSION },
    status: {
      type: String,
      enum: ANALYSIS_STATUSES,
      default: 'completed',
    },
  },
  { timestamps: true, collection: 'analyses' }
);

analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports =
  mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
