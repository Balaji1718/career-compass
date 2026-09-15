'use strict';

const express = require('express');
const controller = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { profileSchema } = require('../validators/schemas');

const router = express.Router();

router.use(requireAuth);
router.get('/', controller.getProfile);
router.put('/', validate(profileSchema), controller.updateProfile);

module.exports = router;
