'use strict';

const express = require('express');
const controller = require('../controllers/learningResourceController');
const { validate } = require('../middleware/validate');
const { listQuerySchema } = require('../validators/schemas');

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), controller.listLearningResources);

module.exports = router;
