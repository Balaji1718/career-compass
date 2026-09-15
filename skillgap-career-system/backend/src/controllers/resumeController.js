'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, errors } = require('../utils/apiResponse');
const { Skill } = require('../models');
const aiService = require('../services/ai');
const { normalizeSkillName, canonicalSkillName } = require('../utils/normalize');
const logger = require('../utils/logger');

const MAX_TEXT = 200000;

/** Extracts plain text from an in-memory PDF or DOCX buffer. */
async function extractText(file) {
  const isPdf =
    file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname);
  const isDocx =
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    /\.docx$/i.test(file.originalname);

  try {
    if (isPdf) {
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(file.buffer);
      return String(parsed.text || '').slice(0, MAX_TEXT);
    }
    if (isDocx) {
      const mammoth = require('mammoth');
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      return String(parsed.value || '').slice(0, MAX_TEXT);
    }
  } catch (err) {
    logger.warn(`Resume text extraction failed: ${err && err.message}`);
    throw errors.badRequest(
      'We could not read that file. Try a different PDF or DOCX export.'
    );
  }
  throw errors.badRequest('Only PDF and DOCX resumes are supported.');
}

/**
 * Suggests skills from a resume. Nothing is saved here: the user reviews
 * suggestions and adds them explicitly through the skills endpoints.
 */
const parseResume = asyncHandler(async (req, res) => {
  if (!req.file) throw errors.badRequest('Please choose a resume file to upload.');

  const text = await extractText(req.file);
  if (text.trim().length < 50) {
    throw errors.badRequest(
      'That file did not contain readable text. Scanned image resumes are not supported.'
    );
  }

  const ai = await aiService.analyzeResumeText(text);

  // Deterministic fallback: direct name/alias matching against the skill catalogue.
  const catalogue = await Skill.find({ isActive: true })
    .select('name slug aliases')
    .lean();
  const haystack = ` ${normalizeSkillName(text)} `;
  const deterministic = catalogue
    .filter((skill) => {
      const terms = [skill.name, ...(skill.aliases || [])];
      return terms.some((t) => {
        const n = normalizeSkillName(t);
        return n.length > 2 && haystack.includes(` ${n} `);
      });
    })
    .slice(0, 40);

  const byName = new Map(catalogue.map((s) => [normalizeSkillName(s.name), s]));

  const suggestions = [];
  const seen = new Set();

  if (ai.available) {
    for (const item of ai.data.skills) {
      const canonical = canonicalSkillName(item.name);
      const match = byName.get(normalizeSkillName(canonical));
      if (!match || seen.has(String(match._id))) continue;
      seen.add(String(match._id));
      suggestions.push({
        skillId: match._id,
        name: match.name,
        proficiencyLevel: item.proficiencyLevel,
        evidence: item.evidence,
        source: 'ai_suggested',
      });
    }
  }

  for (const skill of deterministic) {
    if (seen.has(String(skill._id))) continue;
    seen.add(String(skill._id));
    suggestions.push({
      skillId: skill._id,
      name: skill.name,
      proficiencyLevel: 2,
      evidence: 'Mentioned in your resume text.',
      source: 'resume',
    });
  }

  return sendSuccess(res, {
    suggestions,
    aiAvailable: ai.available,
    aiMessage: ai.available ? null : aiService.AI_UNAVAILABLE_MESSAGE,
    reviewRequired: true,
    unusedSlugCount: bySlug.size,
  });
});

module.exports = { parseResume, extractText };
