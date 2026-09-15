'use strict';

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: { type: Date, required: true },
    lastAccessedAt: { type: Date, default: Date.now },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true, collection: 'sessions' }
);

// MongoDB removes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.Session || mongoose.model('Session', sessionSchema);
