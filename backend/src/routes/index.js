'use strict';

const express = require('express');
const mongoose = require('mongoose');

const { sendSuccess } = require('../utils/apiResponse');
const aiService = require('../services/ai');

const router = express.Router();

router.get('/health', (_req, res) =>
  sendSuccess(res, {
    status: 'ok',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai: aiService.providerStatus(),
  })
);

router.use('/auth', require('./authRoutes'));
router.use('/profile', require('./profileRoutes'));
router.use('/skills', require('./skillRoutes'));
router.use('/user-skills', require('./userSkillRoutes'));
router.use('/careers', require('./careerRoutes'));
router.use('/analyses', require('./analysisRoutes'));
router.use('/recommendations', require('./recommendationRoutes'));
router.use('/roadmaps', require('./roadmapRoutes'));
router.use('/learning-resources', require('./learningResourceRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/resume', require('./resumeRoutes'));

module.exports = router;
