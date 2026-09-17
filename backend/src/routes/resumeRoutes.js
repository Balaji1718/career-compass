'use strict';

const express = require('express');
const multer = require('multer');
const controller = require('../controllers/resumeController');
const { requireAuth } = require('../middleware/auth');
const { errors } = require('../utils/apiResponse');

const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// Memory storage: nothing is written to disk, so there is nothing to clean up
// and no uploaded file is ever reachable as a static asset.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const extOk = /\.(pdf|docx)$/i.test(file.originalname || '');
    if (!ALLOWED.has(file.mimetype) || !extOk) {
      return cb(errors.badRequest('Only PDF and DOCX resumes are supported.'));
    }
    return cb(null, true);
  },
});

const router = express.Router();

router.post('/parse', requireAuth, upload.single('resume'), controller.parseResume);

module.exports = router;
