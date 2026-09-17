'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { env } = require('../src/config/env');
const {
  connectDatabase,
  disconnectDatabase,
  classifyMongoError,
} = require('../src/config/db');

test('MongoDB Error Classification: Identifies auth and network errors without exposing credentials', () => {
  const authErr = new Error('bad auth : authentication failed');
  const classifiedAuth = classifyMongoError(authErr);
  assert.match(classifiedAuth, /Authentication failed/i);
  assert.doesNotMatch(classifiedAuth, /mongodb\+srv|cluster0|1810%40Google/i);

  const netErr = new Error('getaddrinfo ENOTFOUND cluster0.fake.mongodb.net');
  const classifiedNet = classifyMongoError(netErr);
  assert.match(classifiedNet, /Network\/Cluster unreachable/i);
});

test('MongoDB Fallback: Rejects and does not silently fall back when ALLOW_LOCAL_MONGO_FALLBACK is false', async () => {
  await disconnectDatabase();

  const prevFallback = env.allowLocalMongoFallback;
  const prevIsProd = env.isProduction;

  env.allowLocalMongoFallback = false;
  env.isProduction = false;

  // Attempt to connect to an unreachable URI
  const unreachableUri = 'mongodb://127.0.0.1:27999/unreachable_test_db?connectTimeoutMS=500';

  await assert.rejects(
    async () => {
      await connectDatabase(unreachableUri);
    },
    (err) => {
      assert.match(err.message, /MongoDB connection failed/i);
      return true;
    }
  );

  env.allowLocalMongoFallback = prevFallback;
  env.isProduction = prevIsProd;
  await disconnectDatabase();
});

test('MongoDB Fallback: Never attempts local fallback in production mode even if flag is true', async () => {
  await disconnectDatabase();

  const prevFallback = env.allowLocalMongoFallback;
  const prevIsProd = env.isProduction;

  env.allowLocalMongoFallback = true;
  env.isProduction = true; // In production, fallback must never be used

  const unreachableUri = 'mongodb://127.0.0.1:27999/unreachable_test_db?connectTimeoutMS=500';

  await assert.rejects(
    async () => {
      await connectDatabase(unreachableUri);
    },
    (err) => {
      assert.match(err.message, /MongoDB connection failed/i);
      return true;
    }
  );

  env.allowLocalMongoFallback = prevFallback;
  env.isProduction = prevIsProd;
  await disconnectDatabase();
});
