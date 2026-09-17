'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, errors } = require('../utils/apiResponse');
const { UserSkill, Skill } = require('../models');
const { assertOwnership } = require('../middleware/auth');

const listUserSkills = asyncHandler(async (req, res) => {
  const rows = await UserSkill.find({ userId: req.user._id })
    .populate('skillId', 'name slug category')
    .sort({ proficiencyLevel: -1 })
    .lean();

  const skills = rows
    .filter((r) => r.skillId)
    .map((r) => ({
      _id: r._id,
      skillId: r.skillId._id,
      name: r.skillId.name,
      slug: r.skillId.slug,
      category: r.skillId.category,
      proficiencyLevel: r.proficiencyLevel,
      source: r.source,
      verified: r.verified,
      yearsOfExperience: r.yearsOfExperience,
      evidence: r.evidence,
      updatedAt: r.updatedAt,
    }));

  return sendSuccess(res, { skills });
});

const createUserSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.body.skillId).lean();
  if (!skill || !skill.isActive) {
    throw errors.badRequest('That skill does not exist.');
  }

  const existing = await UserSkill.findOne({
    userId: req.user._id,
    skillId: skill._id,
  });
  if (existing) {
    throw errors.conflict('That skill is already in your profile.');
  }

  const created = await UserSkill.create({
    ...req.body,
    userId: req.user._id,
    verified: req.body.source === 'ai_suggested' ? false : req.body.verified,
    lastAssessedAt: new Date(),
  });

  return sendSuccess(res, { userSkill: created.toObject(), skill }, 201);
});

const updateUserSkill = asyncHandler(async (req, res) => {
  const row = await UserSkill.findById(req.params.id);
  if (!row) throw errors.notFound('That skill entry could not be found.');
  assertOwnership(row.userId, req);

  if (req.body.proficiencyLevel !== undefined) {
    row.proficiencyLevel = req.body.proficiencyLevel;
    row.lastAssessedAt = new Date();
  }
  if (req.body.yearsOfExperience !== undefined) {
    row.yearsOfExperience = req.body.yearsOfExperience;
  }
  if (req.body.verified !== undefined) row.verified = req.body.verified;

  await row.save();
  return sendSuccess(res, { userSkill: row.toObject() });
});

const deleteUserSkill = asyncHandler(async (req, res) => {
  const row = await UserSkill.findById(req.params.id);
  if (!row) throw errors.notFound('That skill entry could not be found.');
  assertOwnership(row.userId, req);
  await row.deleteOne();
  return sendSuccess(res, { deleted: true });
});

module.exports = {
  listUserSkills,
  createUserSkill,
  updateUserSkill,
  deleteUserSkill,
};
