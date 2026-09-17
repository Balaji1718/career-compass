'use strict';

const mongoose = require('mongoose');
const { EXPERIENCE_LEVELS } = require('../config/constants');

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, maxlength: 160 },
    field: { type: String, trim: true, maxlength: 160 },
    institution: { type: String, trim: true, maxlength: 200 },
    graduationYear: { type: Number, min: 1950, max: 2100 },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    location: { type: String, trim: true, maxlength: 160, default: '' },
    education: { type: [educationSchema], default: [] },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      default: 'student',
    },
    yearsOfExperience: { type: Number, min: 0, max: 60, default: 0 },
    interests: { type: [String], default: [] },
    preferredCareerIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    ],
    preferredDomains: { type: [String], default: [] },
    careerGoal: { type: String, trim: true, maxlength: 500, default: '' },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true, collection: 'profiles' }
);

module.exports =
  mongoose.models.Profile || mongoose.model('Profile', profileSchema);
