'use strict';

/**
 * Idempotent master-data seed.
 *
 * Reads the JSON files produced by `npm run esco:extract` and upserts them.
 * Re-running never creates duplicate careers, skills, careerSkills or
 * learning resources: every upsert is keyed on a deterministic identifier
 * (slug, sourceId, or careerId+skillId).
 *
 * Usage: npm run seed
 */

const fs = require('fs');
const path = require('path');

const { connectDatabase, disconnectDatabase } = require('../config/db');
const {
  Career,
  Skill,
  CareerSkill,
  LearningResource,
} = require('../models');
const { normalizeSkillName } = require('../utils/normalize');
const logger = require('../utils/logger');

const SEED_DIR = __dirname;

function readSeedFile(name, { optional = false } = {}) {
  const file = path.join(SEED_DIR, name);
  if (!fs.existsSync(file)) {
    if (optional) return [];
    throw new Error(
      `Missing seed file: ${file}\nRun "npm run esco:extract" first to build it from the provided ESCO CSV files.`
    );
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function emptyStats() {
  return { inserted: 0, updated: 0, skipped: 0 };
}

function tallyBulk(result, stats) {
  stats.inserted += result.upsertedCount || 0;
  stats.updated += result.modifiedCount || 0;
  stats.skipped +=
    (result.matchedCount || 0) - (result.modifiedCount || 0);
}

async function seedSkills(skills) {
  const stats = emptyStats();
  if (!skills.length) return stats;
  const ops = skills.map((skill) => ({
    updateOne: {
      filter: { slug: skill.slug },
      update: {
        $set: {
          name: skill.name,
          category: skill.category,
          description: skill.description,
          aliases: skill.aliases,
          isActive: skill.isActive !== false,
          source: skill.source,
          sourceId: skill.sourceId,
          sourceVersion: skill.sourceVersion,
        },
        $setOnInsert: { slug: skill.slug },
      },
      upsert: true,
    },
  }));
  tallyBulk(await Skill.bulkWrite(ops, { ordered: false }), stats);

  const validSkillSlugs = skills.map((s) => s.slug);
  const deactivatedSkills = await Skill.updateMany(
    { source: 'ESCO', slug: { $nin: validSkillSlugs }, isActive: true },
    { $set: { isActive: false } }
  );
  if (deactivatedSkills.modifiedCount > 0) {
    logger.info(`Deactivated ${deactivatedSkills.modifiedCount} obsolete/excluded ESCO skills`);
  }

  return stats;
}

async function seedCareers(careers) {
  const stats = emptyStats();
  if (!careers.length) return stats;
  const ops = careers.map((career) => ({
    updateOne: {
      filter: { slug: career.slug },
      update: {
        $set: {
          title: career.title,
          category: career.category,
          description: career.description,
          overview: career.overview,
          educationRequirements: career.educationRequirements || [],
          experienceLevels: career.experienceLevels || ['entry'],
          responsibilities: career.responsibilities || [],
          source: career.source,
          sourceId: career.sourceId,
          sourceVersion: career.sourceVersion,
          isActive: career.isActive !== false,
        },
        $setOnInsert: { slug: career.slug },
      },
      upsert: true,
    },
  }));
  tallyBulk(await Career.bulkWrite(ops, { ordered: false }), stats);

  // Deactivate any previously seeded ESCO careers that were removed by tightened filters
  const validSlugs = careers.map((c) => c.slug);
  const deactivated = await Career.updateMany(
    { source: 'ESCO', slug: { $nin: validSlugs }, isActive: true },
    { $set: { isActive: false } }
  );
  if (deactivated.modifiedCount > 0) {
    logger.info(`Deactivated ${deactivated.modifiedCount} obsolete/excluded ESCO careers`);
  }

  return stats;
}

async function seedCareerSkills(careerSkills) {
  const stats = emptyStats();
  if (!careerSkills.length) return stats;

  const [careers, skills] = await Promise.all([
    Career.find({}).select('slug').lean(),
    Skill.find({}).select('slug').lean(),
  ]);
  const careerIdBySlug = new Map(careers.map((c) => [c.slug, c._id]));
  const skillIdBySlug = new Map(skills.map((s) => [s.slug, s._id]));

  const ops = [];
  for (const row of careerSkills) {
    const careerId = careerIdBySlug.get(row.careerSlug);
    const skillId = skillIdBySlug.get(row.skillSlug);
    if (!careerId || !skillId) {
      stats.skipped += 1;
      continue;
    }
    ops.push({
      updateOne: {
        filter: { careerId, skillId },
        update: {
          $set: {
            requirementType: row.requirementType,
            minimumLevel: row.minimumLevel,
            importance: row.importance,
            priority: row.priority,
            isCore: row.isCore,
          },
          $setOnInsert: { careerId, skillId },
        },
        upsert: true,
      },
    });
  }
  if (ops.length) {
    tallyBulk(await CareerSkill.bulkWrite(ops, { ordered: false }), stats);
  }
  return stats;
}

/** Curated free resources, attached to whichever skills actually exist. */
async function seedLearningResources(groups) {
  const stats = emptyStats();
  if (!groups.length) return stats;

  const skills = await Skill.find({ isActive: true })
    .select('name slug aliases')
    .lean();

  const ops = [];
  for (const group of groups) {
    const terms = group.match.map(normalizeSkillName);
    const matched = skills.filter((skill) => {
      const candidates = [skill.name, ...(skill.aliases || [])].map(
        normalizeSkillName
      );
      return candidates.some((c) => terms.some((t) => c === t || c.includes(t)));
    });

    if (!matched.length) {
      stats.skipped += group.resources.length;
      continue;
    }

    for (const skill of matched.slice(0, 6)) {
      for (const resource of group.resources) {
        const { url, ...resourceFields } = resource;
        ops.push({
          updateOne: {
            filter: { skillId: skill._id, url },
            update: {
              $set: { ...resourceFields, isActive: true },
              $setOnInsert: { skillId: skill._id, url },
            },
            upsert: true,
          },
        });
      }
    }
  }

  if (ops.length) {
    tallyBulk(await LearningResource.bulkWrite(ops, { ordered: false }), stats);
  }
  return stats;
}

function report(label, stats) {
  logger.info(
    `${label.padEnd(18)} inserted: ${stats.inserted}, updated: ${stats.updated}, unchanged/skipped: ${stats.skipped}`
  );
}

async function run() {
  await connectDatabase();

  const skills = readSeedFile('skills.json');
  const careers = readSeedFile('careers.json');
  const careerSkills = readSeedFile('careerSkills.json');
  const resourceGroups = readSeedFile('learningResources.json', { optional: true });

  const skillStats = await seedSkills(skills);
  const careerStats = await seedCareers(careers);
  const careerSkillStats = await seedCareerSkills(careerSkills);
  const resourceStats = await seedLearningResources(resourceGroups);

  logger.info('--- Seed summary ---');
  report('skills', skillStats);
  report('careers', careerStats);
  report('careerSkills', careerSkillStats);
  report('learningResources', resourceStats);
  logger.info('Seeding is idempotent: rerunning updates in place.');

  await disconnectDatabase();
}

if (require.main === module) {
  run().catch(async (err) => {
    logger.error(err.message);
    try {
      await disconnectDatabase();
    } catch (_e) {
      /* already closed */
    }
    process.exit(1);
  });
}

module.exports = {
  run,
  seedSkills,
  seedCareers,
  seedCareerSkills,
  seedLearningResources,
};
