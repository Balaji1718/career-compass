'use strict';

const express = require('express');
const controller = require('../controllers/recommendationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/careers', requireAuth, controller.getCareerRecommendations);

module.exports = router;
