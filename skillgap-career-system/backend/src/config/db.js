'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

let connectionPromise = null;

/**
 * Connects to MongoDB using MONGODB_URI. Safe to call multiple times.
 */
function connectDatabase(uri) {
  const target = uri || env.mongoUri;
  if (!target) {
    return Promise.reject(new Error('MONGODB_URI is not configured.'));
  }
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(target, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: true,
    })
    .then((conn) => {
      logger.info(`MongoDB connected: ${conn.connection.name}`);
      return conn;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

async function disconnectDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase, mongoose };
