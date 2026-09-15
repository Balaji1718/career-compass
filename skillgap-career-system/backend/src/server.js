'use strict';

/**
 * Single-server entry point.
 *
 *   Browser -> Express -> /api/*            (JSON API)
 *                      -> Vite middleware   (development, with HMR)
 *                      -> dist + SPA fallback (production)
 *
 * One process, one port. `npm run dev` is all that is needed.
 */

const path = require('path');
const fs = require('fs');
const express = require('express');

const { env, assertRequiredEnv } = require('./config/env');
const { connectDatabase } = require('./config/db');
const { createApp } = require('./app');
const logger = require('./utils/logger');

const ROOT = path.resolve(__dirname, '../..');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const DIST_DIR = path.join(ROOT, 'dist');

async function mountDevFrontend(app) {
  const { createServer } = require('vite');
  const vite = await createServer({
    configFile: path.join(FRONTEND_DIR, 'vite.config.js'),
    root: FRONTEND_DIR,
    appType: 'custom',
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);

  // SPA fallback that keeps Vite's HTML transforms (and therefore HMR).
  app.use(async (req, res, next) => {
    if (req.method !== 'GET' || req.originalUrl.startsWith('/api')) return next();
    try {
      const template = fs.readFileSync(
        path.join(FRONTEND_DIR, 'index.html'),
        'utf-8'
      );
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (err) {
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });

  logger.info('Vite dev middleware mounted (HMR enabled)');
}

function mountProdFrontend(app) {
  if (!fs.existsSync(DIST_DIR)) {
    logger.warn('dist/ not found. Run "npm run build" before "npm start".');
    return;
  }
  app.use(express.static(DIST_DIR, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  logger.info('Serving built frontend from dist/');
}

async function start() {
  assertRequiredEnv();

  const app = createApp();

  try {
    await connectDatabase();
  } catch (err) {
    logger.error(
      'Could not connect to MongoDB. Check MONGODB_URI in your .env file.'
    );
    logger.error(err.message);
    process.exit(1);
  }

  if (env.isProduction) {
    mountProdFrontend(app);
  } else {
    await mountDevFrontend(app);
  }

  app.listen(env.port, () => {
    logger.info(
      `Server listening on http://localhost:${env.port} (${env.nodeEnv})`
    );
  });
}

if (require.main === module) {
  start().catch((err) => {
    logger.error(err && err.message ? err.message : err);
    process.exit(1);
  });
}

module.exports = { start };
