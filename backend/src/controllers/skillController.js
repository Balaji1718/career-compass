'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, errors } = require('../utils/apiResponse');
const { Skill } = require('../models');
const { buildMeta } = require('../utils/pagination');

const listSkills = asyncHandler(async (req, res) => {
  const { page, limit, search, category } = req.validatedQuery;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { aliases: rx }];
  }

  const [items, total] = await Promise.all([
    Skill.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name slug category description aliases source sourceId')
      .lean(),
    Skill.countDocuments(filter),
  ]);

  return sendSuccess(res, { skills: items }, 200, buildMeta({ page, limit, total }));
});

const getSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).lean();
  if (!skill || !skill.isActive) {
    throw errors.notFound('That skill could not be found.');
  }
  return sendSuccess(res, { skill });
});

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Skill.distinct('category', { isActive: true });
  return sendSuccess(res, { categories: categories.filter(Boolean).sort() });
});

module.exports = { listSkills, getSkill, listCategories };
