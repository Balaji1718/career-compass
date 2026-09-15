'use strict';

const { z } = require('zod');

/** Extracts the first JSON object from a model response and parses it safely. */
function safeParseJson(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();

  const attempt = (candidate) => {
    try {
      const value = JSON.parse(candidate);
      return value && typeof value === 'object' ? value : null;
    } catch (_err) {
      return null;
    }
  };

  const direct = attempt(cleaned);
  if (direct) return direct;

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) return attempt(cleaned.slice(start, end + 1));
  return null;
}

const stringList = z.array(z.string().min(1).max(500)).max(20).default([]);

const careerExplanationSchema = z.object({
  summary: z.string().min(10).max(2000),
  strengths: stringList,
  gaps: stringList,
  recommendations: stringList,
});

const learningRecommendationsSchema = z.object({
  summary: z.string().min(5).max(2000),
  items: z
    .array(
      z.object({
        skill: z.string().min(1).max(160),
        priority: z.number().int().min(1).max(5).default(3),
        reason: z.string().min(3).max(800),
        practice: stringList,
      })
    )
    .max(20)
    .default([]),
});

const roadmapSchema = z.object({
  summary: z.string().min(5).max(2000),
  stages: z
    .array(
      z.object({
        title: z.string().min(2).max(200),
        skill: z.string().min(1).max(160),
        reason: z.string().min(3).max(800),
        projectIdeas: stringList,
        estimatedHours: z.number().min(1).max(400).default(20),
      })
    )
    .min(1)
    .max(15),
});

const resumeSkillsSchema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        proficiencyLevel: z.number().int().min(1).max(4).default(2),
        evidence: z.string().max(400).default(''),
      })
    )
    .max(60)
    .default([]),
});

/** Parses + validates, returning { ok, data } and never throwing. */
function validateStructured(schema, text) {
  const parsed = safeParseJson(text);
  if (!parsed) return { ok: false, reason: 'malformed' };
  const result = schema.safeParse(parsed);
  if (!result.success) return { ok: false, reason: 'invalid_structure' };
  return { ok: true, data: result.data };
}

module.exports = {
  safeParseJson,
  validateStructured,
  careerExplanationSchema,
  learningRecommendationsSchema,
  roadmapSchema,
  resumeSkillsSchema,
};
