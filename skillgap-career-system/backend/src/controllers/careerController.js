'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, errors } = require('../utils/apiResponse');
const { Career } = require('../models');
const { buildMeta } = require('../utils/pagination');
const engine = require('../services/skillGapEngine');
const { getRequirements, getUserSkillLevels } = require('../services/careerDataService');

const listCareers = asyncHandler(async (req, res) => {
  const { page, limit, search, category } = req.validatedQuery;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const [careers, total] = await Promise.all([
    Career.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title slug category description experienceLevels')
      .lean(),
    Career.countDocuments(filter),
  ]);

  // Signed-in users also see their deterministic match for each listed career.
  let scored = careers;
  if (req.user) {
    const [userLevels, requirements] = await Promise.all([
      getUserSkillLevels(req.user._id),
      getRequirements(careers.map((c) => c._id)),
    ]);
    const byCareer = new Map();
    for (const r of requirements) {
      if (!byCareer.has(r.careerId)) byCareer.set(r.careerId, []);
      byCareer.get(r.careerId).push(r);
    }
    scored = careers.map((c) => {
      const reqs = byCareer.get(String(c._id)) || [];
      if (!reqs.length) return { ...c, matchScore: null };
      const result = engine.analyseCareer(reqs, userLevels);
      return {
        ...c,
        matchScore: result.overallMatchScore,
        matchClassification: result.matchClassification,
      };
    });
  }

  return sendSuccess(res, { careers: scored }, 200, buildMeta({ page, limit, total }));
});

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Career.distinct('category', { isActive: true });
  return sendSuccess(res, { categories: categories.filter(Boolean).sort() });
});

const getCareer = asyncHandler(async (req, res) => {
  const career = await Career.findById(req.params.id)
    .populate('relatedCareerIds', 'title slug category')
    .lean();
  if (!career || !career.isActive) {
    throw errors.notFound('That career could not be found.');
  }

  const requirements = await getRequirements(career._id);
  const required = requirements.filter((r) => r.requirementType === 'required');
  const preferred = requirements.filter((r) => r.requirementType === 'preferred');

  let analysisPreview = null;
  if (req.user) {
    const userLevels = await getUserSkillLevels(req.user._id);
    if (requirements.length) {
      const result = engine.analyseCareer(requirements, userLevels);
      analysisPreview = {
        overallMatchScore: result.overallMatchScore,
        matchClassification: result.matchClassification,
        skillCoverage: result.skillCoverage,
        matchedCount: result.matchedSkills.length,
        weakCount: result.weakSkills.length,
        missingCount: result.missingSkills.length,
      };
    }
  }

  return sendSuccess(res, {
    career,
    requiredSkills: required,
    preferredSkills: preferred,
    analysisPreview,
  });
});

module.exports = { listCareers, getCareer, listCategories };
