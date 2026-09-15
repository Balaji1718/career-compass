'use strict';

const { CareerSkill, UserSkill } = require('../models');

/** Requirement rows for one or many careers, with skill names resolved. */
async function getRequirements(careerIds) {
  const ids = Array.isArray(careerIds) ? careerIds : [careerIds];
  const rows = await CareerSkill.find({ careerId: { $in: ids } })
    .populate('skillId', 'name slug category')
    .lean();

  return rows
    .filter((row) => row.skillId)
    .map((row) => ({
      careerId: String(row.careerId),
      skillId: String(row.skillId._id),
      skillName: row.skillId.name,
      skillSlug: row.skillId.slug,
      skillCategory: row.skillId.category,
      requirementType: row.requirementType,
      minimumLevel: row.minimumLevel,
      importance: row.importance,
      priority: row.priority,
      isCore: row.isCore,
    }));
}

/** Map of skillId -> proficiencyLevel for the user's verified skills. */
async function getUserSkillLevels(userId) {
  const rows = await UserSkill.find({ userId, verified: true })
    .select('skillId proficiencyLevel')
    .lean();
  const map = new Map();
  for (const row of rows) map.set(String(row.skillId), row.proficiencyLevel);
  return map;
}

module.exports = { getRequirements, getUserSkillLevels };
