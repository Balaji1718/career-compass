'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { LearningResource } = require('../models');
const { buildMeta } = require('../utils/pagination');

const listLearningResources = asyncHandler(async (req, res) => {
  const { page, limit, skillId, search } = req.validatedQuery;
  const filter = { isActive: true };
  if (skillId) filter.skillId = skillId;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.title = rx;
  }

  const [items, total] = await Promise.all([
    LearningResource.find(filter)
      .populate('skillId', 'name slug')
      .sort({ isFree: -1, qualityScore: -1, title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    LearningResource.countDocuments(filter),
  ]);

  return sendSuccess(res, { resources: items }, 200, buildMeta({ page, limit, total }));
});

module.exports = { listLearningResources };
