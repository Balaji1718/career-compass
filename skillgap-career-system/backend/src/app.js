'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { env } = require('./config/env');
const apiRoutes = require('./routes');
const { attachUser } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/error');

/**
 * Builds the Express app with the API mounted at /api.
 * Frontend serving is added by server.js so tests can use the API alone.
 */
function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      // Vite's dev client needs inline scripts; CSP is enabled in production only.
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.sessionSecret));
  app.use(attachUser);

  app.use('/api', apiRoutes);
  app.use('/api', notFoundHandler);
  app.use('/api', errorHandler);

  return app;
}

module.exports = { createApp, errorHandler, notFoundHandler };
