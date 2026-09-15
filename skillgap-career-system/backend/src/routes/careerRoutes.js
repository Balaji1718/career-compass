'use strict';

const express = require('express');
const controller = require('../controllers/careerController');
const { validate, validateObjectId } = require('../middleware/validate');
const { listQuerySchema } = require('../validators/schemas');

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), controller.listCareers);
router.get('/categories', controller.listCategories);
router.get('/:id', validateObjectId('id'), controller.getCareer);

module.exports = router;
