'use strict';

/**
 * ESCO v1.2.1 -> application seed files.
 *
 *   occupations_en.csv              -> seeds/careers.json
 *   skills_en.csv                   -> seeds/skills.json
 *   occupationSkillRelations_en.csv -> seeds/careerSkills.json
 *
 * The source CSV files are read only; they are never modified.
 * Column names are resolved from the real header row, never guessed.
 * Processing is streamed, so the whole dataset is never held in memory.
 *
 * Usage: npm run esco:extract
 */

const fs = require('fs');
const path = require('path');

const { env } = require('../config/env');
const { streamCsv, readHeaders, findHeader } = require('../utils/csv');
const { slugify, canonicalSkillName, aliasesFor } = require('../utils/normalize');
const config = require('./escoConfig');
const logger = require('../utils/logger');

const OUT_DIR = __dirname;

function resolveDataDir() {
  const dir = path.isAbsolute(env.escoDataDir)
    ? env.escoDataDir
    : path.resolve(__dirname, '../../../', env.escoDataDir);
  return dir;
}

function requireFile(dir, name) {
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing ESCO file: ${file}\n` +
        'Place the provided ESCO v1.2.1 English CSV classification files in ' +
        `${dir} (or set ESCO_DATA_DIR in .env).`
    );
  }
  return file;
}

async function extract() {
  const dir = resolveDataDir();
  const occupationsFile = requireFile(dir, 'occupations_en.csv');
  const skillsFile = requireFile(dir, 'skills_en.csv');
  const relationsFile = requireFile(dir, 'occupationSkillRelations_en.csv');

  // ---- 1. occupations -> careers -------------------------------------
  const occHeaders = await readHeaders(occupationsFile);
  logger.info(`occupations_en.csv headers: ${occHeaders.join(' | ')}`);

  const colOccUri = findHeader(occHeaders, 'conceptUri', 'occupationUri', 'uri');
  const colOccLabel = findHeader(occHeaders, 'preferredLabel', 'label');
  const colOccAlt = findHeader(occHeaders, 'altLabels', 'alternativeLabels');
  const colOccDesc = findHeader(occHeaders, 'description', 'definition');
  const colIsco = findHeader(occHeaders, 'iscoGroup', 'code');

  if (!colOccUri || !colOccLabel) {
    throw new Error(
      'occupations_en.csv does not contain the expected concept URI / preferred label columns.'
    );
  }

  const careers = [];
  const careerByUri = new Map();

  await streamCsv(occupationsFile, (row) => {
    const title = String(row[colOccLabel] || '').trim();
    const uri = String(row[colOccUri] || '').trim();
    if (!title || !uri) return;
    const iscoGroup = colIsco ? String(row[colIsco] || '').trim() : '';
    if (!config.isRelevantOccupation({ title, iscoGroup })) return;

    const description = colOccDesc ? String(row[colOccDesc] || '').trim() : '';
    const career = {
      title,
      slug: slugify(title),
      category: config.categoryForTitle(title),
      description: description.slice(0, 600),
      overview: description,
      educationRequirements: [],
      experienceLevels: ['entry', 'junior', 'mid'],
      responsibilities: [],
      source: config.SOURCE,
      sourceId: uri,
      sourceVersion: config.SOURCE_VERSION,
      isActive: true,
      escoAltLabels: colOccAlt
        ? String(row[colOccAlt] || '')
            .split(/\n|\|/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 8)
        : [],
    };
    if (careerByUri.has(uri)) return;
    careerByUri.set(uri, career);
    careers.push(career);
  });

  logger.info(`Selected ${careers.length} IT-related occupations from ESCO.`);
  if (!careers.length) {
    throw new Error(
      'No occupations matched the IT selection rules. Check that the provided ESCO files are the English classification export.'
    );
  }

  // ---- 2. relations (restricted to the selected occupations) ----------
  const relHeaders = await readHeaders(relationsFile);
  logger.info(`occupationSkillRelations_en.csv headers: ${relHeaders.join(' | ')}`);

  const colRelOcc = findHeader(relHeaders, 'occupationUri', 'conceptUri');
  const colRelSkill = findHeader(relHeaders, 'skillUri');
  const colRelType = findHeader(relHeaders, 'relationType');
  const colRelSkillType = findHeader(relHeaders, 'skillType');

  if (!colRelOcc || !colRelSkill) {
    throw new Error(
      'occupationSkillRelations_en.csv does not contain occupationUri / skillUri columns.'
    );
  }

  const relations = [];
  const neededSkillUris = new Set();
  const seenPairs = new Set();

  await streamCsv(relationsFile, (row) => {
    const occUri = String(row[colRelOcc] || '').trim();
    if (!careerByUri.has(occUri)) return;
    const skillUri = String(row[colRelSkill] || '').trim();
    if (!skillUri) return;

    const pair = `${occUri}::${skillUri}`;
    if (seenPairs.has(pair)) return;
    seenPairs.add(pair);

    const mapped = config.mapRelation(
      colRelType ? row[colRelType] : 'essential',
      colRelSkillType ? row[colRelSkillType] : ''
    );
    relations.push({ careerSourceId: occUri, skillSourceId: skillUri, ...mapped });
    neededSkillUris.add(skillUri);
  });

  logger.info(
    `Kept ${relations.length} ESCO occupation-skill relations covering ${neededSkillUris.size} skills.`
  );

  // ---- 3. skills (only those actually referenced) ---------------------
  const skillHeaders = await readHeaders(skillsFile);
  logger.info(`skills_en.csv headers: ${skillHeaders.join(' | ')}`);

  const colSkillUri = findHeader(skillHeaders, 'conceptUri', 'skillUri', 'uri');
  const colSkillLabel = findHeader(skillHeaders, 'preferredLabel', 'label');
  const colSkillAlt = findHeader(skillHeaders, 'altLabels', 'alternativeLabels');
  const colSkillDesc = findHeader(skillHeaders, 'description', 'definition');
  const colSkillType = findHeader(skillHeaders, 'skillType');
  const colReuse = findHeader(skillHeaders, 'reuseLevel');

  if (!colSkillUri || !colSkillLabel) {
    throw new Error(
      'skills_en.csv does not contain the expected concept URI / preferred label columns.'
    );
  }

  const skills = [];
  const slugSeen = new Map();
  const skillUriToSlug = new Map();

  await streamCsv(skillsFile, (row) => {
    const uri = String(row[colSkillUri] || '').trim();
    if (!neededSkillUris.has(uri)) return;

    const rawName = String(row[colSkillLabel] || '').trim();
    if (!rawName) return;

    // Alias normalisation: JS / Javascript / ECMAScript collapse to one record.
    const name = canonicalSkillName(rawName);
    let slug = slugify(name);

    const escoAliases = colSkillAlt
      ? String(row[colSkillAlt] || '')
          .split(/\n|\|/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12)
      : [];

    if (slugSeen.has(slug)) {
      // Same canonical skill appearing under another ESCO URI: merge, do not duplicate.
      const existing = slugSeen.get(slug);
      existing.aliases = Array.from(
        new Set([...existing.aliases, rawName, ...escoAliases])
      ).slice(0, 20);
      skillUriToSlug.set(uri, slug);
      return;
    }

    const skill = {
      name,
      slug,
      category:
        colSkillType && /knowledge/i.test(row[colSkillType] || '')
          ? 'knowledge'
          : 'skill/competence',
      description: colSkillDesc ? String(row[colSkillDesc] || '').trim().slice(0, 800) : '',
      aliases: Array.from(
        new Set([...aliasesFor(name), ...(rawName !== name ? [rawName] : []), ...escoAliases])
      ).slice(0, 20),
      isActive: true,
      source: config.SOURCE,
      sourceId: uri,
      sourceVersion: config.SOURCE_VERSION,
      reuseLevel: colReuse ? String(row[colReuse] || '') : '',
    };
    slugSeen.set(slug, skill);
    skillUriToSlug.set(uri, slug);
    skills.push(skill);
  });

  logger.info(`Extracted ${skills.length} distinct skills after normalisation.`);

  // ---- 4. rewrite relations against the merged skill slugs ------------
  const careerSkills = [];
  const relSeen = new Set();
  let droppedRelations = 0;

  for (const rel of relations) {
    const skillSlug = skillUriToSlug.get(rel.skillSourceId);
    const career = careerByUri.get(rel.careerSourceId);
    if (!skillSlug || !career) {
      droppedRelations += 1;
      continue;
    }
    const key = `${career.slug}::${skillSlug}`;
    if (relSeen.has(key)) continue;
    relSeen.add(key);
    careerSkills.push({
      careerSlug: career.slug,
      skillSlug,
      requirementType: rel.requirementType,
      minimumLevel: rel.minimumLevel,
      importance: rel.importance,
      priority: rel.priority,
      isCore: rel.isCore,
      source: config.SOURCE,
      sourceVersion: config.SOURCE_VERSION,
    });
  }

  if (droppedRelations) {
    logger.warn(
      `${droppedRelations} relations referenced skills missing from skills_en.csv and were dropped.`
    );
  }

  // Careers with no requirements cannot be analysed; drop them.
  const withRequirements = new Set(careerSkills.map((cs) => cs.careerSlug));
  const finalCareers = careers.filter((c) => withRequirements.has(c.slug));

  // Deterministic ordering so the seed files are stable across runs.
  finalCareers.sort((a, b) => a.slug.localeCompare(b.slug));
  skills.sort((a, b) => a.slug.localeCompare(b.slug));
  careerSkills.sort(
    (a, b) => a.careerSlug.localeCompare(b.careerSlug) || a.skillSlug.localeCompare(b.skillSlug)
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'careers.json'),
    `${JSON.stringify(finalCareers, null, 2)}\n`
  );
  fs.writeFileSync(path.join(OUT_DIR, 'skills.json'), `${JSON.stringify(skills, null, 2)}\n`);
  fs.writeFileSync(
    path.join(OUT_DIR, 'careerSkills.json'),
    `${JSON.stringify(careerSkills, null, 2)}\n`
  );

  logger.info('--- ESCO extraction summary ---');
  logger.info(`careers.json      : ${finalCareers.length}`);
  logger.info(`skills.json       : ${skills.length}`);
  logger.info(`careerSkills.json : ${careerSkills.length}`);
  logger.info('Seed files written to backend/src/seeds/. Run "npm run seed" next.');

  return { careers: finalCareers, skills, careerSkills };
}

if (require.main === module) {
  extract().catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });
}

module.exports = { extract };
