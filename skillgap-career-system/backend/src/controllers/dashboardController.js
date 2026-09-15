'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { UserSkill, Analysis, Roadmap } = require('../models');
const { recommendCareers } = require('../services/recommendationService');
const aiService = require('../services/ai');

/** Aggregated payload for the dashboard, in one round trip. */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [skills, latestAnalysis, recentAnalyses, roadmap] = await Promise.all([
    UserSkill.find({ userId })
      .populate('skillId', 'name category')
      .select('skillId proficiencyLevel verified')
      .lean(),
    Analysis.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('careerTitle overallMatchScore matchClassification status createdAt')
      .lean(),
    Roadmap.findOne({ userId }).sort({ createdAt: -1 }).lean(),
  ]);

  const named = skills
    .filter((s) => s.skillId)
    .map((s) => ({
      name: s.skillId.name,
      category: s.skillId.category,
      proficiencyLevel: s.proficiencyLevel,
    }));

  const strongest = named
    .filter((s) => s.proficiencyLevel >= 3)
    .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
    .slice(0, 5);
  const weakest = named
    .filter((s) => s.proficiencyLevel <= 2)
    .sort((a, b) => a.proficiencyLevel - b.proficiencyLevel)
    .slice(0, 5);

  const { recommendations } = await recommendCareers(userId, { limit: 3 });

  return sendSuccess(res, {
    skillCount: named.length,
    strongestSkills: strongest,
    weakestSkills: weakest,
    latestAnalysis: latestAnalysis
      ? {
          _id: latestAnalysis._id,
          careerTitle: latestAnalysis.careerTitle,
          overallMatchScore: latestAnalysis.overallMatchScore,
          matchClassification: latestAnalysis.matchClassification,
          matchedCount: (latestAnalysis.matchedSkills || []).length,
          weakCount: (latestAnalysis.weakSkills || []).length,
          missingCount: (latestAnalysis.missingSkills || []).length,
          createdAt: latestAnalysis.createdAt,
        }
      : null,
    topRecommendations: recommendations,
    roadmap: roadmap
      ? {
          _id: roadmap._id,
          title: roadmap.title,
          progressPercentage: roadmap.progressPercentage,
          status: roadmap.status,
          stageCount: roadmap.stages.length,
        }
      : null,
    recentAnalyses,
    aiConfigured: aiService.providerStatus().anyConfigured,
  });
});

module.exports = { getDashboard };
