'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, errors } = require('../utils/apiResponse');
const { Analysis, Roadmap } = require('../models');
const { assertOwnership } = require('../middleware/auth');
const { runAnalysis } = require('../services/analysisService');
const { buildMeta } = require('../utils/pagination');

const createAnalysis = asyncHandler(async (req, res) => {
  const result = await runAnalysis(req.user._id, req.body.careerId);
  return sendSuccess(res, result, 201);
});

const listAnalyses = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const filter = { userId: req.user._id };
  const [items, total] = await Promise.all([
    Analysis.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        'careerId careerTitle overallMatchScore matchClassification skillCoverage status createdAt algorithmVersion'
      )
      .lean(),
    Analysis.countDocuments(filter),
  ]);
  return sendSuccess(res, { analyses: items }, 200, buildMeta({ page, limit, total }));
});

const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id).lean();
  if (!analysis) throw errors.notFound('That analysis could not be found.');
  assertOwnership(analysis.userId, req);

  const roadmap = await Roadmap.findOne({ analysisId: analysis._id })
    .select('_id title progressPercentage status')
    .lean();

  return sendSuccess(res, { analysis, roadmap: roadmap || null });
});

module.exports = { createAnalysis, listAnalyses, getAnalysis };
