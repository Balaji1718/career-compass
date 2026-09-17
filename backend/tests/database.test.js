'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { connectDatabase, disconnectDatabase } = require('../src/config/db');
const { User, Profile, Skill, Career, CareerSkill, Session } = require('../src/models');

describe('Database & Model Validation', () => {
  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    await disconnectDatabase();
  });

  test('User schema normalizes email and strips passwordHash in JSON', () => {
    const user = new User({
      name: 'Test Candidate',
      email: 'CANDIDATE@Example.COM',
      passwordHash: 'hashed_secret_123',
    });

    assert.equal(user.email, 'candidate@example.com');
    const json = user.toJSON();
    assert.equal(json.passwordHash, undefined);
    assert.equal(json.name, 'Test Candidate');
  });

  test('User schema requires valid email and name', () => {
    const user = new User({});
    const err = user.validateSync();
    assert.ok(err.errors.email);
    assert.ok(err.errors.name);
    assert.ok(err.errors.passwordHash);
  });

  test('Profile schema defaults to student and validates year range', () => {
    const profile = new Profile({
      userId: new (require('mongoose').Types.ObjectId)(),
      education: [{ degree: 'BS CS', graduationYear: 2025 }],
    });

    assert.equal(profile.experienceLevel, 'student');
    assert.equal(profile.yearsOfExperience, 0);
    assert.equal(profile.education[0].graduationYear, 2025);
  });

  test('Session model defines TTL index on expiresAt', () => {
    const indexes = Session.schema.indexes();
    const ttlIndex = indexes.find(
      ([fields, options]) => fields.expiresAt === 1 && options && options.expireAfterSeconds === 0
    );
    assert.ok(ttlIndex, 'Session model must have an expiresAt TTL index');
  });

  test('CareerSkill defines compound unique index on careerId and skillId', () => {
    const indexes = CareerSkill.schema.indexes();
    const compound = indexes.find(
      ([fields, options]) => fields.careerId === 1 && fields.skillId === 1 && options && options.unique === true
    );
    assert.ok(compound, 'CareerSkill must have a compound unique index on careerId + skillId');
  });
});
