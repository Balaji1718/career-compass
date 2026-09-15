'use strict';

/** Turns any label into a stable url-safe slug used for de-duplication. */
function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Canonical form used when matching a free-text skill name to a skill record. */
function normalizeSkillName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Well-known alias groups so that "JS", "Javascript" and "ECMAScript"
 * all resolve to the single canonical JavaScript skill.
 */
const ALIAS_GROUPS = [
  { canonical: 'JavaScript', aliases: ['js', 'javascript', 'ecmascript', 'es6', 'es2015'] },
  { canonical: 'TypeScript', aliases: ['ts', 'typescript'] },
  { canonical: 'Python', aliases: ['python', 'python3', 'py'] },
  { canonical: 'React', aliases: ['react', 'react js', 'reactjs', 'react.js'] },
  { canonical: 'Node.js', aliases: ['node', 'nodejs', 'node js', 'node.js'] },
  { canonical: 'MongoDB', aliases: ['mongo', 'mongodb', 'mongo db'] },
  { canonical: 'SQL', aliases: ['sql', 'structured query language'] },
  { canonical: 'PostgreSQL', aliases: ['postgres', 'postgresql', 'psql'] },
  { canonical: 'CSS', aliases: ['css', 'css3', 'cascading style sheets'] },
  { canonical: 'HTML', aliases: ['html', 'html5', 'hypertext markup language'] },
  { canonical: 'Git', aliases: ['git', 'version control with git'] },
  { canonical: 'Docker', aliases: ['docker', 'containers', 'containerisation'] },
  { canonical: 'Kubernetes', aliases: ['k8s', 'kubernetes'] },
  { canonical: 'Machine Learning', aliases: ['ml', 'machine learning'] },
  { canonical: 'Artificial Intelligence', aliases: ['ai', 'artificial intelligence'] },
];

const ALIAS_LOOKUP = new Map();
for (const group of ALIAS_GROUPS) {
  for (const alias of group.aliases) {
    ALIAS_LOOKUP.set(normalizeSkillName(alias), group.canonical);
  }
}

/** Returns the canonical display name for a possibly-aliased skill name. */
function canonicalSkillName(value) {
  const key = normalizeSkillName(value);
  return ALIAS_LOOKUP.get(key) || String(value || '').trim();
}

/** Alias list for a canonical name, used when seeding skill documents. */
function aliasesFor(canonical) {
  const group = ALIAS_GROUPS.find(
    (g) => normalizeSkillName(g.canonical) === normalizeSkillName(canonical)
  );
  return group ? group.aliases.slice() : [];
}

module.exports = {
  slugify,
  normalizeSkillName,
  canonicalSkillName,
  aliasesFor,
  ALIAS_GROUPS,
};
