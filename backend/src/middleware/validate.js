'use strict';

const mongoose = require('mongoose');
const { errors } = require('../utils/apiResponse');

/** Validates req[source] with a zod schema and replaces it with parsed data. */
function validate(schema, source = 'body') {
  return function validateMiddleware(req, _res, next) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(
        errors.validation('Please correct the highlighted fields.', details)
      );
    }
    req[source === 'query' ? 'validatedQuery' : source] = result.data;
    return next();
  };
}

/** Rejects malformed ObjectIds before they reach the database. */
function validateObjectId(param = 'id') {
  return function objectIdMiddleware(req, _res, next) {
    const value = req.params[param];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(errors.badRequest('That identifier is not valid.'));
    }
    return next();
  };
}

module.exports = { validate, validateObjectId };
