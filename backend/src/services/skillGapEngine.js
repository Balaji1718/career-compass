'use strict';

/**
 * Deterministic skill-gap engine.
 *
 * This module is the ONLY place where match scores are calculated.
 * AI is never involved in producing any number here.
 */

const {
  ALGORITHM_VERSION,
  MATCH_BANDS,
  PREFERRED_WEIGHT_FACTOR,
  SCORE_PRECISION,
} = require('../config/constants');

function round(value, precision = SCORE_PRECISION) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/** Maps a 0-100 score to its configured classification band. */
function classifyScore(score) {
  const band = MATCH_BANDS.find((b) => score >= b.min);
  return band ? band.label : 'Low Match';
}

/**
 * Per-skill match value in the range 0..1.
 *  - no user skill            -> 0
 *  - user level >= required   -> 1
 *  - otherwise                -> userLevel / requiredLevel
 */
function skillMatchValue(userLevel, requiredLevel) {
  if (!userLevel || userLevel <= 0) return 0;
  if (!requiredLevel || requiredLevel <= 0) return 1;
  if (userLevel >= requiredLevel) return 1;
  return userLevel / requiredLevel;
}

/** Effective weight: preferred requirements count less than required ones. */
function requirementWeight(requirement) {
  const importance = Number(requirement.importance) || 1;
  return requirement.requirementType === 'preferred'
    ? importance * PREFERRED_WEIGHT_FACTOR
    : importance;
}

/**
 * Compares a user's skills against one career's requirements.
 *
 * @param {Array} requirements career-skill requirement rows:
 *   { skillId, skillName, minimumLevel, importance, priority, requirementType, isCore }
 * @param {Map|Object} userSkillLevels map of skillId(string) -> proficiencyLevel(1..4)
 */
function analyseCareer(requirements, userSkillLevels) {
  const levelOf = (skillId) => {
    const key = String(skillId);
    if (userSkillLevels instanceof Map) return Number(userSkillLevels.get(key) || 0);
    return Number((userSkillLevels || {})[key] || 0);
  };

  const matchedSkills = [];
  const weakSkills = [];
  const missingSkills = [];

  let weightedSum = 0;
  let weightTotal = 0;

  for (const req of requirements) {
    const requiredLevel = Number(req.minimumLevel) || 1;
    const userLevel = levelOf(req.skillId);
    const match = skillMatchValue(userLevel, requiredLevel);
    const weight = requirementWeight(req);

    weightedSum += match * weight;
    weightTotal += weight;

    const row = {
      skillId: req.skillId,
      skillName: req.skillName,
      requiredLevel,
      userLevel,
      importance: Number(req.importance) || 1,
      priority: Number(req.priority) || 3,
      requirementType: req.requirementType || 'required',
      isCore: Boolean(req.isCore),
      skillMatch: round(match, 3),
      gap: Math.max(0, requiredLevel - userLevel),
    };

    if (userLevel <= 0) missingSkills.push(row);
    else if (userLevel >= requiredLevel) matchedSkills.push(row);
    else weakSkills.push(row);
  }

  const overallMatchScore =
    weightTotal === 0 ? 0 : round((weightedSum / weightTotal) * 100);

  const totalRequirements = requirements.length;
  const skillCoverage =
    totalRequirements === 0
      ? 0
      : round(((matchedSkills.length + weakSkills.length) / totalRequirements) * 100);

  // Priority gaps: missing/weak, ordered by importance, then gap size, then priority.
  const priorityGaps = [...missingSkills, ...weakSkills].sort(
    (a, b) =>
      b.importance - a.importance ||
      b.gap - a.gap ||
      b.priority - a.priority ||
      String(a.skillName).localeCompare(String(b.skillName))
  );

  const strengths = matchedSkills
    .slice()
    .sort((a, b) => b.importance - a.importance || b.userLevel - a.userLevel)
    .slice(0, 8)
    .map((s) => s.skillName);

  return {
    algorithmVersion: ALGORITHM_VERSION,
    overallMatchScore,
    matchClassification: classifyScore(overallMatchScore),
    skillCoverage,
    matchedSkills,
    weakSkills,
    missingSkills,
    priorityGaps,
    strengths,
    totalRequirements,
  };
}

/**
 * Deterministic, human-readable recommendation lines derived from the gaps.
 * Used as-is when AI is unavailable.
 */
function buildDeterministicRecommendations(result, careerTitle) {
  const lines = [];
  lines.push(
    `Your profile matches ${result.overallMatchScore}% of the skill requirements for ${careerTitle} (${result.matchClassification}).`
  );
  if (result.strengths.length) {
    lines.push(`Strongest areas: ${result.strengths.slice(0, 5).join(', ')}.`);
  }
  const top = result.priorityGaps.slice(0, 5);
  for (const gap of top) {
    if (gap.userLevel === 0) {
      lines.push(
        `Start learning ${gap.skillName} — it is ${gap.requirementType} at level ${gap.requiredLevel} and you have not recorded it yet.`
      );
    } else {
      lines.push(
        `Raise ${gap.skillName} from level ${gap.userLevel} to ${gap.requiredLevel} to close a ${gap.gap}-level gap.`
      );
    }
  }
  if (!top.length) {
    lines.push('No significant gaps found. Focus on depth, projects and portfolio work.');
  }
  return lines;
}

module.exports = {
  analyseCareer,
  classifyScore,
  skillMatchValue,
  requirementWeight,
  buildDeterministicRecommendations,
  round,
  ALGORITHM_VERSION,
};
