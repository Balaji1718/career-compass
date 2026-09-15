'use strict';

/**
 * Selection rules for the IT/software subset of the provided ESCO dataset.
 *
 * Nothing here invents data: these are only filters applied to the real
 * rows in occupations_en.csv. Every selected occupation, skill and
 * relation comes from the provided files.
 */

const SOURCE = 'ESCO';
const SOURCE_VERSION = '1.2.1';

/**
 * ISCO-08 groups that cover ICT work:
 *  25x  ICT professionals (software/application developers, DB/network pros)
 *  35x  ICT technicians
 *  133  ICT service managers
 *  212/211 partially relevant (data/statistics) - matched by keyword instead.
 */
const ISCO_PREFIXES = ['25', '35', '133'];

/** Title keywords used in addition to the ISCO groups. */
const TITLE_KEYWORDS = [
  'software',
  'web develop',
  'front-end',
  'frontend',
  'back-end',
  'backend',
  'full stack',
  'full-stack',
  'application develop',
  'mobile application',
  'embedded system',
  'data analy',
  'data scien',
  'data engineer',
  'database',
  'machine learning',
  'artificial intelligence',
  'cloud',
  'devops',
  'system administrator',
  'systems analyst',
  'ict system',
  'ict application',
  'ict network',
  'ict security',
  'ict business analyst',
  'ict test',
  'software test',
  'quality assurance',
  'cyber',
  'security',
  'user interface',
  'user experience',
  'ux',
  'ui design',
  'integration engineer',
  'ict research',
];

/** Titles that match a keyword but are not IT careers. */
const TITLE_EXCLUSIONS = [
  'security guard',
  'security officer',
  'aviation security',
  'fire safety',
  'social security',
  'cloud seeding',
];

/** Category assignment, evaluated in order against the ESCO title. */
const CATEGORY_RULES = [
  { match: ['machine learning', 'artificial intelligence'], category: 'AI & Machine Learning' },
  { match: ['data scien'], category: 'Data Science' },
  { match: ['data analy', 'business intelligence'], category: 'Data Analysis' },
  { match: ['data engineer', 'data warehouse'], category: 'Data Engineering' },
  { match: ['database'], category: 'Databases' },
  { match: ['cyber', 'security'], category: 'Cybersecurity' },
  { match: ['cloud', 'devops'], category: 'Cloud & DevOps' },
  { match: ['test', 'quality assurance'], category: 'Testing & QA' },
  { match: ['user interface', 'user experience', 'ux', 'ui design'], category: 'UI/UX' },
  { match: ['network', 'system administrator'], category: 'Infrastructure & Networks' },
  { match: ['analyst', 'business'], category: 'Analysis & Consulting' },
  { match: ['web develop', 'front-end', 'frontend'], category: 'Web Development' },
  { match: ['software', 'develop', 'programmer', 'engineer'], category: 'Software Development' },
];

const DEFAULT_CATEGORY = 'Information Technology';

/**
 * Deterministic mapping from an ESCO relation row to our requirement fields.
 * ESCO states whether a skill is essential or optional for an occupation;
 * we translate that, and only that, into requirement type, level and weight.
 */
function mapRelation(relationType, skillType) {
  const essential = String(relationType).toLowerCase().includes('essential');
  const isCompetence = String(skillType).toLowerCase().includes('skill');
  return {
    requirementType: essential ? 'required' : 'preferred',
    minimumLevel: essential ? 3 : 2,
    importance: essential ? 5 : 2,
    priority: essential ? 5 : 2,
    isCore: essential && isCompetence,
  };
}

function categoryForTitle(title) {
  const lower = String(title).toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.match.some((m) => lower.includes(m))) return rule.category;
  }
  return DEFAULT_CATEGORY;
}

function isRelevantOccupation({ title, iscoGroup }) {
  const lower = String(title).toLowerCase();
  if (TITLE_EXCLUSIONS.some((x) => lower.includes(x))) return false;
  const code = String(iscoGroup || '');
  if (ISCO_PREFIXES.some((p) => code.startsWith(p))) return true;
  return TITLE_KEYWORDS.some((k) => lower.includes(k));
}

module.exports = {
  SOURCE,
  SOURCE_VERSION,
  ISCO_PREFIXES,
  TITLE_KEYWORDS,
  TITLE_EXCLUSIONS,
  DEFAULT_CATEGORY,
  mapRelation,
  categoryForTitle,
  isRelevantOccupation,
};
