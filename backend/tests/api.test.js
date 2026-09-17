'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { connectDatabase, disconnectDatabase } = require('../src/config/db');
const { User, Session } = require('../src/models');

describe('API Endpoints & Authentication', () => {
  let app;
  const testEmail = `tester_${Date.now()}@example.com`;
  const testPassword = 'Password123';
  let sessionCookie = '';

  before(async () => {
    await connectDatabase();
    app = createApp();
  });

  after(async () => {
    await User.deleteMany({ email: testEmail });
    await disconnectDatabase();
  });

  test('POST /api/auth/register fails on invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(res.body.error.details));
  });

  test('GET /api/profile returns 401 UNAUTHORIZED when no cookie sent', async () => {
    const res = await request(app).get('/api/profile');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('Registers user, logs in, accesses protected /api/auth/me, then logs out', async () => {
    // 1. Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Integration Tester', email: testEmail, password: testPassword });

    assert.equal(regRes.status, 201);
    assert.equal(regRes.body.success, true);
    assert.equal(regRes.body.data.user.email, testEmail);

    const cookies = regRes.headers['set-cookie'];
    assert.ok(cookies, 'Expected set-cookie header');
    sessionCookie = cookies[0];

    // 2. Access /api/auth/me with session cookie
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.data.user.email, testEmail);

    // 3. Log out
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);

    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.success, true);

    // 4. Access /api/auth/me after logout -> user is null
    const postLogoutMeRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);

    assert.equal(postLogoutMeRes.status, 200);
    assert.equal(postLogoutMeRes.body.data.user, null);

    // 5. Access protected /api/profile after logout -> 401
    const postLogoutProfileRes = await request(app)
      .get('/api/profile')
      .set('Cookie', sessionCookie);

    assert.equal(postLogoutProfileRes.status, 401);
  });

  test('Returns 404 with standard error shape on nonexistent API route', async () => {
    const res = await request(app).get('/api/nonexistent-route');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});
