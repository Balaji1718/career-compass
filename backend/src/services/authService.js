'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Session, Profile } = require('../models');
const { env } = require('../config/env');
const {
  SESSION_TTL_DAYS,
  SESSION_COOKIE_NAME,
} = require('../config/constants');
const { errors } = require('../utils/apiResponse');

const BCRYPT_ROUNDS = 12;

function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function newSessionId() {
  return crypto.randomBytes(48).toString('hex');
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    signed: true,
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

/** Creates a DB-backed session and sets the signed HTTP-only cookie. */
async function createSession(res, user, userAgent) {
  const sessionId = newSessionId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await Session.create({
    sessionId,
    userId: user._id,
    expiresAt,
    userAgent: String(userAgent || '').slice(0, 300),
    lastAccessedAt: new Date(),
  });
  res.cookie(SESSION_COOKIE_NAME, sessionId, cookieOptions());
  return sessionId;
}

async function destroySession(req, res) {
  const sessionId = req.signedCookies && req.signedCookies[SESSION_COOKIE_NAME];
  if (sessionId) await Session.deleteOne({ sessionId });
  res.clearCookie(SESSION_COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
}

async function register({ name, email, password }, res, userAgent) {
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    throw errors.conflict('An account with that email already exists.');
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    lastLoginAt: new Date(),
  });
  await Profile.create({ userId: user._id });
  await createSession(res, user, userAgent);
  return user.toJSON();
}

async function login({ email, password }, res, userAgent) {
  const user = await User.findOne({ email: String(email).toLowerCase() }).select(
    '+passwordHash'
  );
  // Same message for unknown email and wrong password.
  const invalid = errors.unauthorized('Email or password is incorrect.');
  if (!user || !user.isActive) throw invalid;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw invalid;

  user.lastLoginAt = new Date();
  await user.save();
  await createSession(res, user, userAgent);
  return user.toJSON();
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  register,
  login,
  cookieOptions,
  SESSION_COOKIE_NAME,
};
