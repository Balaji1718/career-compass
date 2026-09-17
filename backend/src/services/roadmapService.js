'use strict';

const { Analysis, Roadmap, LearningResource } = require('../models');
const { HOURS_PER_LEVEL_STEP } = require('../config/constants');
const aiService = require('./ai');
const { errors } = require('../utils/apiResponse');

/**
 * Deterministic stage ordering: importance, then gap size, then priority,
 * then core-first, then alphabetical for stability.
 */
function orderGaps(analysis) {
  const gaps = [
    ...(analysis.missingSkills || []),
    ...(analysis.weakSkills || []),
  ];
  return gaps.sort(
    (a, b) =>
      b.importance - a.importance ||
      b.gap - a.gap ||
      b.priority - a.priority ||
      Number(b.isCore) - Number(a.isCore) ||
      String(a.skillName).localeCompare(String(b.skillName))
  );
}

function estimateHours(gap) {
  const steps = Math.max(1, gap.requiredLevel - gap.userLevel);
  return steps * HOURS_PER_LEVEL_STEP;
}

function genericProjects(skillName) {
  return [
    `Build a small project that uses ${skillName} end to end.`,
    `Recreate an existing tool using ${skillName} and document your decisions.`,
    `Write a short article or README explaining what you learned about ${skillName}.`,
  ];
}

async function resourcesForSkills(skillIds) {
  const rows = await LearningResource.find({
    skillId: { $in: skillIds },
    isActive: true,
  })
    .sort({ isFree: -1, qualityScore: -1 })
    .lean();
  const map = new Map();
  for (const row of rows) {
    const key = String(row.skillId);
    if (!map.has(key)) map.set(key, []);
    if (map.get(key).length < 3) {
      map.get(key).push({
        title: row.title,
        url: row.url,
        resourceType: row.resourceType,
        provider: row.provider,
        isFree: row.isFree,
        estimatedHours: row.estimatedHours,
      });
    }
  }
  return map;
}

/**
 * Builds a roadmap from a completed analysis.
 * Stage order, skills and hours are deterministic; AI may only enrich
 * titles, reasons and project ideas for the stages we already chose.
 */
async function buildRoadmap(userId, analysisId, { maxStages = 8 } = {}) {
  const analysis = await Analysis.findById(analysisId).lean();
  if (!analysis) throw errors.notFound('That analysis could not be found.');
  if (String(analysis.userId) !== String(userId)) {
    throw errors.forbidden('You do not have access to this analysis.');
  }

  const gaps = orderGaps(analysis).slice(0, maxStages);
  if (!gaps.length) {
    throw errors.badRequest(
      'This analysis has no skill gaps, so there is nothing to put in a roadmap.'
    );
  }

  const resourceMap = await resourcesForSkills(gaps.map((g) => g.skillId));

  const ai = await aiService.generateLearningRoadmap(
    { careerTitle: analysis.careerTitle, overallMatchScore: analysis.overallMatchScore },
    gaps
  );

  const aiStageBySkill = new Map();
  if (ai.available) {
    for (const stage of ai.data.stages) {
      aiStageBySkill.set(String(stage.skill).toLowerCase().trim(), stage);
    }
  }

  const stages = gaps.map((gap, index) => {
    const aiStage = aiStageBySkill.get(String(gap.skillName).toLowerCase().trim());
    const deterministicReason =
      gap.userLevel === 0
        ? `${gap.skillName} is ${gap.requirementType} for this career at level ${gap.requiredLevel} and is missing from your profile.`
        : `You are at level ${gap.userLevel} in ${gap.skillName} but this career expects level ${gap.requiredLevel}.`;

    return {
      stageNumber: index + 1,
      title: aiStage ? aiStage.title : `Stage ${index + 1}: ${gap.skillName}`,
      skillId: gap.skillId,
      skillName: gap.skillName,
      priority: gap.priority || 3,
      reason: aiStage ? aiStage.reason : deterministicReason,
      // Hours stay deterministic even when AI supplies text.
      estimatedHours: estimateHours(gap),
      resources: resourceMap.get(String(gap.skillId)) || [],
      projects:
        aiStage && aiStage.projectIdeas.length
          ? aiStage.projectIdeas
          : genericProjects(gap.skillName),
      completed: false,
    };
  });

  const roadmap = new Roadmap({
    userId,
    analysisId: analysis._id,
    careerId: analysis.careerId,
    title: `Roadmap to ${analysis.careerTitle}`,
    objective: ai.available
      ? ai.data.summary
      : `Close the ${gaps.length} highest-impact skill gaps between your profile and ${analysis.careerTitle}.`,
    stages,
    aiMetadata: ai.available ? ai.metadata : { available: false, reason: ai.reason },
  });
  roadmap.recalculateProgress();
  await roadmap.save();

  return {
    roadmap: roadmap.toObject(),
    aiAvailable: ai.available,
    aiMessage: ai.available ? null : aiService.AI_UNAVAILABLE_MESSAGE,
  };
}

module.exports = { buildRoadmap, orderGaps, estimateHours };
