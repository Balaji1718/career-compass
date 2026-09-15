'use strict';

const { Career } = require('../models');
const engine = require('./skillGapEngine');
const { getRequirements, getUserSkillLevels } = require('./careerDataService');

/**
 * Ranks all active careers for a user using the deterministic engine only.
 * AI never influences the ordering or the scores.
 */
async function recommendCareers(userId, { limit = 10 } = {}) {
  const [careers, userLevels] = await Promise.all([
    Career.find({ isActive: true }).select('title slug category description').lean(),
    getUserSkillLevels(userId),
  ]);

  if (!careers.length) return { recommendations: [], skillCount: userLevels.size };

  const allRequirements = await getRequirements(careers.map((c) => c._id));
  const byCareer = new Map();
  for (const req of allRequirements) {
    if (!byCareer.has(req.careerId)) byCareer.set(req.careerId, []);
    byCareer.get(req.careerId).push(req);
  }

  const recommendations = careers
    .map((career) => {
      const reqs = byCareer.get(String(career._id)) || [];
      const result = engine.analyseCareer(reqs, userLevels);
      return {
        careerId: String(career._id),
        title: career.title,
        slug: career.slug,
        category: career.category,
        description: career.description,
        score: result.overallMatchScore,
        classification: result.matchClassification,
        skillCoverage: result.skillCoverage,
        requirementCount: reqs.length,
        strengths: result.strengths.slice(0, 4),
        majorGaps: result.priorityGaps.slice(0, 4).map((g) => ({
          skillName: g.skillName,
          requiredLevel: g.requiredLevel,
          userLevel: g.userLevel,
        })),
      };
    })
    .filter((r) => r.requirementCount > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);

  return {
    recommendations,
    skillCount: userLevels.size,
    algorithmVersion: engine.ALGORITHM_VERSION,
  };
}

module.exports = { recommendCareers };
