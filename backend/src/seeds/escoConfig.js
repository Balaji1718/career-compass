'use strict';

/**
 * Selection and heuristic mapping rules for the IT/software subset of the ESCO v1.2.1 dataset.
 *
 * Source: Official ESCO v1.2.1 English classification export.
 * No occupations or skills are invented; all records originate from the dataset files.
 *
 * NOTE ON APPLICATION HEURISTICS:
 * Raw ESCO relations specify only qualitative relation types ('essential' vs 'optional').
 * The numeric values (minimumLevel: 1..4, importance: 1..5, priority: 1..5) are
 * application-level heuristics mapped deterministically from ESCO essential/optional
 * indicators to enable quantitative mathematical skill-gap analysis.
 */

const SOURCE = 'ESCO';
const SOURCE_VERSION = '1.2.1';

/**
 * Specific ISCO-08 groups that strictly represent ICT professions and technician roles:
 *  - 25:   ICT professionals (251: Software & applications developers/analysts, 252: Database & network professionals)
 *  - 351:  Information and communications technology operations and user support technicians (3511, 3512, 3513, 3514)
 *  - 133:  Information and communications technology service managers (1330)
 *
 * (Note: ISCO 352 represents broadcasting/telecom technicians which contains non-ICT audiovisual,
 * camera, sound, and projection trades; therefore only 351 is included by default).
 */
const ISCO_PREFIXES = ['25', '351', '133'];

/**
 * Token-aware inclusion patterns for ICT occupations using word boundaries.
 * Short abbreviations (e.g. \bux\b, \bui\b, \bict\b) MUST use word boundaries
 * to prevent substring collisions (e.g., 'ux' matching 'auxiliary').
 */
const INCLUSION_PATTERNS = [
  /\bsoftware\b/i,
  /\bweb develop/i,
  /\bfront-?end\b/i,
  /\bback-?end\b/i,
  /\bfull-?stack\b/i,
  /\bapplication develop/i,
  /\bmobile application\b/i,
  /\bdata (analyst|analysis|analytics|scientist|science|engineer|warehouse|quality)\b/i,
  /\bdatabase\b/i,
  /\bmachine learning\b/i,
  /\bartificial intelligence\b/i,
  /\bcloud (architect|engineer|devops|software|developer|identity)\b/i,
  /\bdevops\b/i,
  /\b(system|systems|network) administrator\b/i,
  /\bsystems? analyst\b/i,
  /\bsystems? architect\b/i,
  /\bict\b/i,
  /\bcyber\b/i,
  /\bcybersecurity\b/i,
  /\binformation security\b/i,
  /\buser (interface|experience)\b/i,
  /\bux\b/i,
  /\bui\b (designer|developer)\b/i,
  /\bsoftware test/i,
  /\bquality assurance\b/i,
  /\bnetwork (architect|engineer|technician)\b/i,
  /\bembedded systems? (software|security|designer|developer)\b/i,
  /\bdigital (games|forensics|transformation)\b/i,
  /\bethical hacker\b/i,
  /\bblockchain\b/i,
  /\bcomputer scientist\b/i,
  /\bcomputer vision\b/i,
  /\benterprise architect\b/i,
  /\bintegration engineer\b/i,
  /\biot developer\b/i,
  /\bit auditor\b/i,
  /\bwebmaster\b/i,
  /\bweb content manager\b/i,
  /\bsearch engine optimisation\b/i,
];

/**
 * Explicit exclusion patterns for non-ICT families that might share partial keywords:
 * - Audiovisual / film / sound / broadcast / stage / media production
 * - Healthcare / nursing / medical / teaching trades
 * - Physical security guards / alarm hardware installers
 * - Commercial retail / shop managers / wholesale / import-export merchants
 * - Physical manufacturing / CNC machine tool operators
 * - Atmospheric weather / cloud seeding
 */
const EXCLUSION_PATTERNS = [
  /\baudio-?visual\b/i,
  /\bboom operator\b/i,
  /\bbroadcast technician\b/i,
  /\bcamera operator\b/i,
  /\bprojectionist\b/i,
  /\brecording studio\b/i,
  /\bsound (designer|editor|mastering|operator)\b/i,
  /\bperformance (rental|video)\b/i,
  /\bvideo technician\b/i,
  /\bstage technician\b/i,
  /\blighting technician\b/i,
  /\bnursing\b/i,
  /\bmidwifery\b/i,
  /\bhealthcare\b/i,
  /\bmedical\b/i,
  /\bteacher\b/i,
  /\bauxiliary\b/i,
  /\bsecurity (guard|officer|alarm|investigator)\b/i,
  /\balarm (technician|investigator)\b/i,
  /\baviation security\b/i,
  /\bfire safety\b/i,
  /\bsocial security\b/i,
  /\bseller\b/i,
  /\bshop manager\b/i,
  /\bdistribution manager\b/i,
  /\bwholesale\b/i,
  /\bimport export\b/i,
  /\bnumerical tool\b/i,
  /\bcloud seeding\b/i,
  /\b(pneumatic|hydraulic|mechanical|battery|energy systems|aviation ground)\b/i,
];

/** Category assignment rules evaluated in order against the title. */
const CATEGORY_RULES = [
  { match: [/\bmachine learning\b/i, /\bartificial intelligence\b/i, /\bcomputer vision\b/i], category: 'AI & Machine Learning' },
  { match: [/\bdata scien/i], category: 'Data Science' },
  { match: [/\bdata (analyst|analysis|analytics|quality)\b/i, /\bbusiness intelligence\b/i, /\bsearch engine optimisation\b/i], category: 'Data Analysis' },
  { match: [/\bdata (engineer|warehouse)\b/i], category: 'Data Engineering' },
  { match: [/\bdatabase\b/i], category: 'Databases' },
  { match: [/\bcyber/i, /\bsecurity\b/i, /\bforensics?\b/i, /\bethical hacker\b/i], category: 'Cybersecurity' },
  { match: [/\bcloud\b/i, /\bdevops\b/i], category: 'Cloud & DevOps' },
  { match: [/\btest/i, /\bquality assurance\b/i], category: 'Testing & QA' },
  { match: [/\buser (interface|experience)\b/i, /\bux\b/i, /\bui (design|designer|developer)\b/i], category: 'UI/UX' },
  { match: [/\bnetwork\b/i, /\bsystem administrator\b/i, /\bdata centre operator\b/i], category: 'Infrastructure & Networks' },
  { match: [/\b(business|disaster recovery|systems?) analyst\b/i, /\bconsultant\b/i, /\bauditor\b/i], category: 'Analysis & Consulting' },
  { match: [/\bweb develop/i, /\bfront-?end\b/i, /\bwebmaster\b/i, /\bweb content\b/i], category: 'Web Development' },
  { match: [/\bsoftware\b/i, /\bapplication develop/i, /\bprogrammer\b/i, /\bdeveloper\b/i, /\barchitect\b/i], category: 'Software Development' },
];

const DEFAULT_CATEGORY = 'Information Technology';

/**
 * Application Heuristic Mapping:
 * ESCO defines binary relation types ('essential' vs 'optional').
 * This function translates that qualitative distinction into quantitative
 * parameters required by the deterministic scoring engine.
 */
function mapRelation(relationType, skillType) {
  const essential = String(relationType).toLowerCase().includes('essential');
  const isCompetence = String(skillType).toLowerCase().includes('skill');
  return {
    requirementType: essential ? 'required' : 'preferred',
    minimumLevel: essential ? 3 : 2, // Application heuristic (scale 1..4)
    importance: essential ? 5 : 2,   // Application heuristic (scale 1..5)
    priority: essential ? 5 : 2,     // Application heuristic (scale 1..5)
    isCore: essential && isCompetence,
  };
}

function categoryForTitle(title) {
  const lower = String(title || '').trim();
  for (const rule of CATEGORY_RULES) {
    const isMatch = rule.match.some((pattern) => {
      if (pattern instanceof RegExp) return pattern.test(lower);
      return lower.toLowerCase().includes(String(pattern).toLowerCase());
    });
    if (isMatch) return rule.category;
  }
  return DEFAULT_CATEGORY;
}

function isRelevantOccupation({ title, iscoGroup }) {
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) return false;

  // 1. Check explicit exclusions
  if (EXCLUSION_PATTERNS.some((pattern) => pattern.test(cleanTitle))) {
    return false;
  }

  // 2. Check strict ICT ISCO groups (25, 351, 133)
  const iscoCode = String(iscoGroup || '').trim();
  if (ISCO_PREFIXES.some((prefix) => iscoCode.startsWith(prefix))) {
    return true;
  }

  // 3. Check token-aware inclusion patterns
  return INCLUSION_PATTERNS.some((pattern) => pattern.test(cleanTitle));
}

module.exports = {
  SOURCE,
  SOURCE_VERSION,
  ISCO_PREFIXES,
  INCLUSION_PATTERNS,
  EXCLUSION_PATTERNS,
  DEFAULT_CATEGORY,
  mapRelation,
  categoryForTitle,
  isRelevantOccupation,
};
