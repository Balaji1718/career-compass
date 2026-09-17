'use strict';

const { Session, User } = require('../models');
const { SESSION_COOKIE_NAME } = require('../config/constants');
const { errors } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** Resolves req.user from the signed session cookie, if one is valid. */
const attachUser = asyncHandler(async (req, _res, next) => {
  req.user = null;
  const sessionId = req.signedCookies && req.signedCookies[SESSION_COOKIE_NAME];
  if (!sessionId) return next();

  const session = await Session.findOne({ sessionId });
  if (!session || session.expiresAt.getTime() <= Date.now()) return next();

  const user = await User.findById(session.userId);
  if (!user || !user.isActive) return next();

  session.lastAccessedAt = new Date();
  await session.save();

  req.user = user;
  req.session = session;
  return next();
});

/** Blocks the request when there is no authenticated user. */
function requireAuth(req, _res, next) {
  if (!req.user) return next(errors.unauthorized('Please sign in to continue.'));
  return next();
}

/** Ownership guard: the resource's userId must equal the caller. */
function assertOwnership(resourceUserId, req) {
  if (String(resourceUserId) !== String(req.user._id)) {
    throw errors.forbidden('You do not have access to this resource.');
  }
}

module.exports = { attachUser, requireAuth, assertOwnership };
