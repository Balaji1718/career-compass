'use strict';

const path = require('path');
const dotenv = require('dotenv');

// Load backend/.env first, then root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || '',
  dbName: process.env.DB_NAME || 'skillgap_career_db',
  allowLocalMongoFallback: process.env.ALLOW_LOCAL_MONGO_FALLBACK === 'true',
  sessionSecret: process.env.SESSION_SECRET || '',
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  nvidiaKey: process.env.NVIDIA_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'openrouter/free',
  nvidiaModel: process.env.NVIDIA_MODEL || '',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 20000),
  escoDataDir: process.env.ESCO_DATA_DIR || './data/esco',
};

env.isProduction = env.nodeEnv === 'production';

function assertRequiredEnv() {
  const missing = [];
  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!env.sessionSecret) missing.push('SESSION_SECRET');
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill them in.'
    );
  }
}

module.exports = { env, assertRequiredEnv };
