'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');
const { Profile } = require('../models');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, res, req.get('user-agent'));
  return sendSuccess(res, { user }, 201);
});

const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body, res, req.get('user-agent'));
  return sendSuccess(res, { user });
});

const logout = asyncHandler(async (req, res) => {
  await authService.destroySession(req, res);
  return sendSuccess(res, { loggedOut: true });
});

/** Session restoration endpoint used by the frontend on every page load. */
const me = asyncHandler(async (req, res) => {
  if (!req.user) return sendSuccess(res, { user: null });
  const profile = await Profile.findOne({ userId: req.user._id }).lean();
  return sendSuccess(res, { user: req.user.toJSON(), profile: profile || null });
});

module.exports = { register, login, logout, me };
