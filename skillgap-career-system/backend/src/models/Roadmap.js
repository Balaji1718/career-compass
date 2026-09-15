'use strict';

const mongoose = require('mongoose');
const { ROADMAP_STATUSES } = require('../config/constants');

const stageResourceSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    resourceType: String,
    provider: String,
    isFree: { type: Boolean, default: true },
    estimatedHours: Number,
  },
  { _id: false }
);

const stageSchema = new mongoose.Schema(
  {
    stageNumber: { type: Number, required: true },
    title: { type: String, required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: String,
    priority: { type: Number, min: 1, max: 5, default: 3 },
    reason: { type: String, default: '' },
    estimatedHours: { type: Number, default: 20 },
    resources: { type: [stageResourceSchema], default: [] },
    projects: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
    },
    careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', required: true },
    title: { type: String, required: true },
    objective: { type: String, default: '' },
    stages: { type: [stageSchema], default: [] },
    totalEstimatedHours: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0 },
    status: { type: String, enum: ROADMAP_STATUSES, default: 'not_started' },
    aiMetadata: {
      provider: String,
      model: String,
      generatedAt: Date,
      available: { type: Boolean, default: false },
      reason: String,
    },
  },
  { timestamps: true, collection: 'roadmaps' }
);

roadmapSchema.index({ userId: 1, createdAt: -1 });

/** Recalculates derived progress fields from stage completion. */
roadmapSchema.methods.recalculateProgress = function recalculateProgress() {
  const total = this.stages.length;
  const done = this.stages.filter((s) => s.completed).length;
  this.progressPercentage = total === 0 ? 0 : Math.round((done / total) * 100);
  this.totalEstimatedHours = this.stages.reduce(
    (sum, s) => sum + (s.estimatedHours || 0),
    0
  );
  if (done === 0) this.status = 'not_started';
  else if (done === total) this.status = 'completed';
  else this.status = 'in_progress';
  return this;
};

module.exports =
  mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);
