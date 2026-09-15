'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, errors } = require('../utils/apiResponse');
const { Roadmap } = require('../models');
const { assertOwnership } = require('../middleware/auth');
const { buildRoadmap } = require('../services/roadmapService');
const { buildMeta } = require('../utils/pagination');

const createRoadmap = asyncHandler(async (req, res) => {
  const result = await buildRoadmap(req.user._id, req.body.analysisId, {
    maxStages: req.body.maxStages,
  });
  return sendSuccess(res, result, 201);
});

const listRoadmaps = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const filter = { userId: req.user._id };
  const [items, total] = await Promise.all([
    Roadmap.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title careerId analysisId progressPercentage status totalEstimatedHours createdAt')
      .lean(),
    Roadmap.countDocuments(filter),
  ]);
  return sendSuccess(res, { roadmaps: items }, 200, buildMeta({ page, limit, total }));
});

const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id).lean();
  if (!roadmap) throw errors.notFound('That roadmap could not be found.');
  assertOwnership(roadmap.userId, req);
  return sendSuccess(res, { roadmap });
});

/** Marks stages complete / incomplete and recalculates progress server-side. */
const updateRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) throw errors.notFound('That roadmap could not be found.');
  assertOwnership(roadmap.userId, req);

  for (const update of req.body.stages) {
    const stage = roadmap.stages.find((s) => s.stageNumber === update.stageNumber);
    if (stage) stage.completed = update.completed;
  }
  roadmap.recalculateProgress();
  await roadmap.save();

  return sendSuccess(res, { roadmap: roadmap.toObject() });
});

module.exports = { createRoadmap, listRoadmaps, getRoadmap, updateRoadmap };
