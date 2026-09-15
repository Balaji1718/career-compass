'use strict';

const mongoose = require('mongoose');
const {
  USER_SKILL_SOURCES,
  MIN_LEVEL,
  MAX_LEVEL,
} = require('../config/constants');

const userSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    proficiencyLevel: {
      type: Number,
      required: true,
      min: MIN_LEVEL,
      max: MAX_LEVEL,
    },
    source: { type: String, enum: USER_SKILL_SOURCES, default: 'manual' },
    confidence: { type: Number, min: 0, max: 1, default: 1 },
    yearsOfExperience: { type: Number, min: 0, max: 60, default: 0 },
    evidence: { type: [String], default: [] },
    // AI-suggested skills stay unverified until the user reviews them.
    verified: { type: Boolean, default: true },
    lastAssessedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'userSkills' }
);

userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

module.exports =
  mongoose.models.UserSkill || mongoose.model('UserSkill', userSkillSchema);
