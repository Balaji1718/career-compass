'use strict';

const express = require('express');
const controller = require('../controllers/roadmapController');
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId } = require('../middleware/validate');
const {
  roadmapCreateSchema,
  roadmapUpdateSchema,
  listQuerySchema,
} = require('../validators/schemas');

const router = express.Router();

router.use(requireAuth);
router.post('/', validate(roadmapCreateSchema), controller.createRoadmap);
router.get('/', validate(listQuerySchema, 'query'), controller.listRoadmaps);
router.get('/:id', validateObjectId('id'), controller.getRoadmap);
router.put(
  '/:id',
  validateObjectId('id'),
  validate(roadmapUpdateSchema),
  controller.updateRoadmap
);

module.exports = router;
