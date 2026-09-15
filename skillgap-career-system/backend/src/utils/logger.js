'use strict';

/* Minimal server-side logger. Never logs secrets or request bodies. */

function stamp() {
  return new Date().toISOString();
}

module.exports = {
  info: (...args) => console.log(`[${stamp()}] [info]`, ...args),
  warn: (...args) => console.warn(`[${stamp()}] [warn]`, ...args),
  error: (...args) => console.error(`[${stamp()}] [error]`, ...args),
};
