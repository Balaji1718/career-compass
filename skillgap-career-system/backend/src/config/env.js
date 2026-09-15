'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  nvidiaKey: process.env.NVIDIA_API_KEY || '',
  openRouterModel:
    process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
  nvidiaModel: process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct',
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
