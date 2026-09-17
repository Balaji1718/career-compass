'use strict';

const mongoose = require('mongoose');
const { RESOURCE_TYPES } = require('../config/constants');

const learningResourceSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    resourceType: { type: String, enum: RESOURCE_TYPES, default: 'documentation' },
    url: { type: String, required: true, trim: true },
    provider: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    estimatedHours: { type: Number, min: 0, default: 10 },
    isFree: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    qualityScore: { type: Number, min: 0, max: 5, default: 4 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'learningResources' }
);

learningResourceSchema.index({ skillId: 1, url: 1 }, { unique: true });

module.exports =
  mongoose.models.LearningResource ||
  mongoose.model('LearningResource', learningResourceSchema);
