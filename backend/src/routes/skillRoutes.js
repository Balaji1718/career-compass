'use strict';

const express = require('express');
const controller = require('../controllers/skillController');
const { validate, validateObjectId } = require('../middleware/validate');
const { listQuerySchema } = require('../validators/schemas');

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), controller.listSkills);
router.get('/categories', controller.listCategories);
router.get('/:id', validateObjectId('id'), controller.getSkill);

module.exports = router;
