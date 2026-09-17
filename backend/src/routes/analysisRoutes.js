'use strict';

const express = require('express');
const controller = require('../controllers/analysisController');
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId } = require('../middleware/validate');
const { analysisCreateSchema, listQuerySchema } = require('../validators/schemas');

const router = express.Router();

router.use(requireAuth);
router.post('/', validate(analysisCreateSchema), controller.createAnalysis);
router.get('/', validate(listQuerySchema, 'query'), controller.listAnalyses);
router.get('/:id', validateObjectId('id'), controller.getAnalysis);

module.exports = router;
