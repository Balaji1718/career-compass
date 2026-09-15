'use strict';

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, trim: true, index: true, default: 'general' },
    description: { type: String, trim: true, default: '' },
    aliases: { type: [String], default: [] },
    proficiencyLevels: {
      type: [String],
      default: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    },
    isActive: { type: Boolean, default: true, index: true },
    source: { type: String, default: 'ESCO' },
    sourceId: { type: String, default: '', index: true },
    sourceVersion: { type: String, default: '1.2.1' },
  },
  { timestamps: true, collection: 'skills' }
);

skillSchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
