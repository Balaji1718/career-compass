'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { Profile, User } = require('../models');

const getProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user._id }).lean();
  if (!profile) {
    profile = (await Profile.create({ userId: req.user._id })).toObject();
  }
  return sendSuccess(res, { profile, user: req.user.toJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, ...profileData } = req.body;

  if (name) {
    await User.updateOne({ _id: req.user._id }, { $set: { name } });
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: profileData },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).lean();

  const user = await User.findById(req.user._id);
  return sendSuccess(res, { profile, user: user.toJSON() });
});

module.exports = { getProfile, updateProfile };
