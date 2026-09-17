'use strict';

const mongoose = require('mongoose');
const { EXPERIENCE_LEVELS } = require('../config/constants');

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, trim: true, index: true, default: 'general' },
    description: { type: String, trim: true, default: '' },
    overview: { type: String, trim: true, default: '' },
    educationRequirements: { type: [String], default: [] },
    experienceLevels: {
      type: [String],
      enum: EXPERIENCE_LEVELS,
      default: ['entry'],
    },
    responsibilities: { type: [String], default: [] },
    relatedCareerIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    ],
    source: { type: String, default: 'ESCO' },
    sourceId: { type: String, default: '', index: true },
    sourceVersion: { type: String, default: '1.2.1' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: 'careers' }
);

careerSchema.index({ title: 'text', description: 'text' });

module.exports =
  mongoose.models.Career || mongoose.model('Career', careerSchema);
