'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

let connectionPromise = null;

function classifyMongoError(err) {
  if (!err) return 'Unknown connection error';
  const msg = String(err.message || '');
  if (/bad auth|authentication failed/i.test(msg)) {
    return 'Authentication failed: Invalid username or password';
  }
  if (/whitelist|could not connect to any servers|ENOTFOUND|ETIMEDOUT/i.test(msg)) {
    return 'Network/Cluster unreachable: Check IP whitelist and internet connection';
  }
  return msg;
}

/**
 * Connects to MongoDB using MONGODB_URI. Safe to call multiple times.
 * Only attempts local fallback if ALLOW_LOCAL_MONGO_FALLBACK=true (never silent).
 */
function connectDatabase(uri) {
  const target = uri || env.mongoUri;
  if (!target) {
    return Promise.reject(new Error('MONGODB_URI is not configured in environment.'));
  }
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(target, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
      dbName: env.dbName || 'skillgap_career_db',
    })
    .then((conn) => {
      logger.info(`MongoDB connected to database: ${conn.connection.name}`);
      return conn;
    })
    .catch(async (err) => {
      const reason = classifyMongoError(err);

      // Check if explicit fallback is allowed (must not be production)
      if (env.allowLocalMongoFallback && !env.isProduction) {
        const localUri = 'mongodb://127.0.0.1:27017/skillgap_career_db';
        if (target !== localUri) {
          logger.warn(
            `Primary MongoDB connection failed (${reason}). ALLOW_LOCAL_MONGO_FALLBACK is true, attempting local MongoDB at 127.0.0.1:27017...`
          );
          try {
            const fallbackConn = await mongoose.connect(localUri, {
              serverSelectionTimeoutMS: 5000,
              autoIndex: true,
              dbName: 'skillgap_career_db',
            });
            logger.info(
              `Connected to fallback local MongoDB database: ${fallbackConn.connection.name}`
            );
            return fallbackConn;
          } catch (localErr) {
            logger.error(`Local MongoDB fallback also failed: ${classifyMongoError(localErr)}`);
          }
        }
      }

      logger.error(
        `MongoDB connection failed: ${reason}. Local fallback is disabled (ALLOW_LOCAL_MONGO_FALLBACK=false). Verify your MONGODB_URI and IP whitelist.`
      );
      connectionPromise = null;
      throw new Error(`MongoDB connection failed: ${reason}`);
    });

  return connectionPromise;
}

async function disconnectDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase, mongoose, classifyMongoError };
