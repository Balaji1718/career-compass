'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { recommendCareers } = require('../services/recommendationService');

const getCareerRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 25);
  const result = await recommendCareers(req.user._id, { limit });
  return sendSuccess(res, result);
});

module.exports = { getCareerRecommendations };
