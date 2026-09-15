'use strict';

const mongoose = require('mongoose');
const { REQUIREMENT_TYPES, MIN_LEVEL, MAX_LEVEL } = require('../config/constants');

const careerSkillSchema = new mongoose.Schema(
  {
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    requirementType: {
      type: String,
      enum: REQUIREMENT_TYPES,
      default: 'required',
    },
    minimumLevel: {
      type: Number,
      min: MIN_LEVEL,
      max: MAX_LEVEL,
      default: 2,
    },
    importance: { type: Number, min: 1, max: 5, default: 3 },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    isCore: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'careerSkills' }
);

careerSkillSchema.index({ careerId: 1, skillId: 1 }, { unique: true });

module.exports =
  mongoose.models.CareerSkill ||
  mongoose.model('CareerSkill', careerSkillSchema);
