'use strict';

function sendSuccess(res, data, status = 200, meta) {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

/** Application error carrying a stable machine-readable code. */
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = true;
  }
}

const errors = {
  badRequest: (message = 'The request was invalid.', details) =>
    new ApiError(400, 'BAD_REQUEST', message, details),
  validation: (message = 'Some of the submitted values are invalid.', details) =>
    new ApiError(422, 'VALIDATION_ERROR', message, details),
  unauthorized: (message = 'You need to sign in to continue.') =>
    new ApiError(401, 'UNAUTHORIZED', message),
  forbidden: (message = 'You do not have access to this resource.') =>
    new ApiError(403, 'FORBIDDEN', message),
  notFound: (message = 'The requested resource was not found.') =>
    new ApiError(404, 'NOT_FOUND', message),
  conflict: (message = 'That resource already exists.') =>
    new ApiError(409, 'CONFLICT', message),
  tooLarge: (message = 'The uploaded file is too large.') =>
    new ApiError(413, 'FILE_TOO_LARGE', message),
  analysisFailed: (message = 'Unable to complete the skill analysis. Please try again.') =>
    new ApiError(500, 'ANALYSIS_FAILED', message),
  internal: (message = 'Something went wrong. Please try again.') =>
    new ApiError(500, 'INTERNAL_ERROR', message),
};

module.exports = { sendSuccess, ApiError, errors };
