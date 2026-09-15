'use strict';

const express = require('express');
const controller = require('../controllers/userSkillController');
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId } = require('../middleware/validate');
const {
  userSkillCreateSchema,
  userSkillUpdateSchema,
} = require('../validators/schemas');

const router = express.Router();

router.use(requireAuth);
router.get('/', controller.listUserSkills);
router.post('/', validate(userSkillCreateSchema), controller.createUserSkill);
router.put(
  '/:id',
  validateObjectId('id'),
  validate(userSkillUpdateSchema),
  controller.updateUserSkill
);
router.delete('/:id', validateObjectId('id'), controller.deleteUserSkill);

module.exports = router;
