'use strict';

const { ApiError, errors } = require('../utils/apiResponse');
const logger = require('../utils/logger');

function notFoundHandler(req, _res, next) {
  next(errors.notFound(`No API route matches ${req.method} ${req.originalUrl}.`));
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, _next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (err && err.name === 'ValidationError') {
      error = errors.validation('Some of the submitted values are invalid.');
    } else if (err && err.name === 'CastError') {
      error = errors.badRequest('One of the provided identifiers is not valid.');
    } else if (err && err.code === 11000) {
      error = errors.conflict('That record already exists.');
    } else if (err && err.code === 'LIMIT_FILE_SIZE') {
      error = errors.tooLarge('The uploaded file is larger than the 5 MB limit.');
    } else {
      error = errors.internal();
    }
  }

  if (error.status >= 500) {
    // Stack traces stay server-side only.
    logger.error(err && err.stack ? err.stack : err);
  }

  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
