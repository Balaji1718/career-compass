'use strict';

const { Career, Analysis } = require('../models');
const engine = require('./skillGapEngine');
const aiService = require('./ai');
const { getRequirements, getUserSkillLevels } = require('./careerDataService');
const { errors } = require('../utils/apiResponse');

/**
 * Runs a full analysis for one user + career.
 * The score is always deterministic; AI only adds an explanation.
 */
async function runAnalysis(userId, careerId) {
  const career = await Career.findOne({ _id: careerId, isActive: true }).lean();
  if (!career) throw errors.notFound('That career could not be found.');

  const [requirements, userLevels] = await Promise.all([
    getRequirements(career._id),
    getUserSkillLevels(userId),
  ]);

  if (!requirements.length) {
    throw errors.badRequest(
      'This career has no skill requirements recorded yet, so it cannot be analysed.'
    );
  }

  const result = engine.analyseCareer(requirements, userLevels);
  const deterministicRecommendations = engine.buildDeterministicRecommendations(
    result,
    career.title
  );

  const analysisContext = { ...result, careerTitle: career.title };
  const ai = await aiService.generateCareerExplanation(analysisContext);

  const doc = await Analysis.create({
    userId,
    careerId: career._id,
    careerTitle: career.title,
    overallMatchScore: result.overallMatchScore,
    matchClassification: result.matchClassification,
    skillCoverage: result.skillCoverage,
    matchedSkills: result.matchedSkills,
    weakSkills: result.weakSkills,
    missingSkills: result.missingSkills,
    strengths: ai.available && ai.data.strengths.length ? ai.data.strengths : result.strengths,
    recommendations:
      ai.available && ai.data.recommendations.length
        ? ai.data.recommendations
        : deterministicRecommendations,
    aiSummary: ai.available ? ai.data.summary : '',
    aiMetadata: ai.available
      ? ai.metadata
      : { available: false, reason: ai.reason },
    algorithmVersion: result.algorithmVersion,
    status: 'completed',
  });

  return {
    analysis: doc.toObject(),
    priorityGaps: result.priorityGaps,
    aiAvailable: ai.available,
    aiMessage: ai.available ? null : aiService.AI_UNAVAILABLE_MESSAGE,
  };
}

module.exports = { runAnalysis };
