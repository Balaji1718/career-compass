'use strict';

/**
 * Single source of truth for business-logic configuration.
 * Scoring formulas must not be duplicated elsewhere in the codebase.
 */

const ALGORITHM_VERSION = '1.0.0';

const PROFICIENCY_LEVELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
};

const MIN_LEVEL = 1;
const MAX_LEVEL = 4;

const REQUIREMENT_TYPES = ['required', 'preferred'];
const USER_SKILL_SOURCES = ['manual', 'resume', 'assessment', 'ai_suggested'];
const RESOURCE_TYPES = [
  'course',
  'documentation',
  'tutorial',
  'video',
  'article',
  'book',
  'practice',
  'project',
];
const EXPERIENCE_LEVELS = ['student', 'entry', 'junior', 'mid', 'senior'];
const ANALYSIS_STATUSES = ['pending', 'completed', 'failed'];
const ROADMAP_STATUSES = ['not_started', 'in_progress', 'completed'];

/** Match classification bands, inclusive lower bound. */
const MATCH_BANDS = [
  { min: 80, label: 'Strong Match' },
  { min: 60, label: 'Moderate Match' },
  { min: 40, label: 'Partial Match' },
  { min: 0, label: 'Low Match' },
];

/** Weighting only counts `preferred` requirements at a reduced weight. */
const PREFERRED_WEIGHT_FACTOR = 0.5;

/** A skill the user has but below the required level is "weak". */
const SCORE_PRECISION = 1;

/** Effort estimate per proficiency level step, used by the deterministic roadmap. */
const HOURS_PER_LEVEL_STEP = 20;

const SESSION_TTL_DAYS = 30;
const SESSION_COOKIE_NAME = 'sgc_session';

module.exports = {
  ALGORITHM_VERSION,
  PROFICIENCY_LEVELS,
  MIN_LEVEL,
  MAX_LEVEL,
  REQUIREMENT_TYPES,
  USER_SKILL_SOURCES,
  RESOURCE_TYPES,
  EXPERIENCE_LEVELS,
  ANALYSIS_STATUSES,
  ROADMAP_STATUSES,
  MATCH_BANDS,
  PREFERRED_WEIGHT_FACTOR,
  SCORE_PRECISION,
  HOURS_PER_LEVEL_STEP,
  SESSION_TTL_DAYS,
  SESSION_COOKIE_NAME,
};
