'use strict';

/**
 * Provider-independent AI service.
 *
 * Controllers call these functions only. No controller, model or React
 * component contains provider-specific code.
 *
 * Order: OpenRouter (primary) -> NVIDIA (fallback) -> unavailable.
 * "Unavailable" is always a normal, non-fatal outcome.
 */

const openrouter = require('./adapters/openrouter');
const nvidia = require('./adapters/nvidia');
const prompts = require('./prompts');
const validators = require('./validate');
const logger = require('../../utils/logger');

const AI_UNAVAILABLE_MESSAGE =
  'AI assistance is temporarily unavailable. Your core skill analysis is still available.';

const PROVIDERS = [openrouter, nvidia];

function providerStatus() {
  return {
    openrouter: openrouter.isConfigured(),
    nvidia: nvidia.isConfigured(),
    anyConfigured: PROVIDERS.some((p) => p.isConfigured()),
  };
}

/**
 * Runs a prompt through the provider chain and validates the JSON result.
 * Always resolves; never throws provider internals to the caller.
 */
async function runStructured({ schema, system, prompt, maxTokens }) {
  const configured = PROVIDERS.filter((p) => p.isConfigured());
  if (!configured.length) {
    return { available: false, reason: 'not_configured', message: AI_UNAVAILABLE_MESSAGE };
  }

  let lastReason = 'unavailable';
  for (const provider of configured) {
    try {
      const { text, model } = await provider.complete({
        system: system || prompts.SYSTEM_BASE,
        prompt,
        maxTokens,
      });
      const validated = validators.validateStructured(schema, text);
      if (!validated.ok) {
        lastReason = validated.reason;
        logger.warn(
          `AI output rejected from ${provider.name}: ${validated.reason}`
        );
        continue; // try the next provider rather than trusting bad output
      }
      return {
        available: true,
        data: validated.data,
        metadata: {
          provider: provider.name,
          model,
          generatedAt: new Date(),
          available: true,
        },
      };
    } catch (err) {
      lastReason = (err && err.kind) || 'unavailable';
      // Only the classified kind is logged - never the raw provider body.
      logger.warn(`AI provider ${provider.name} failed: ${lastReason}`);
    }
  }

  return { available: false, reason: lastReason, message: AI_UNAVAILABLE_MESSAGE };
}

async function generateCareerExplanation(analysis) {
  return runStructured({
    schema: validators.careerExplanationSchema,
    prompt: prompts.careerExplanationPrompt(analysis),
  });
}

async function generateLearningRecommendations(analysis) {
  return runStructured({
    schema: validators.learningRecommendationsSchema,
    prompt: prompts.learningRecommendationsPrompt(analysis),
  });
}

async function generateLearningRoadmap(analysis, stageSkills) {
  return runStructured({
    schema: validators.roadmapSchema,
    prompt: prompts.roadmapPrompt(analysis, stageSkills),
    maxTokens: 1400,
  });
}

async function analyzeResumeText(resumeText) {
  return runStructured({
    schema: validators.resumeSkillsSchema,
    prompt: prompts.resumePrompt(resumeText),
    maxTokens: 1200,
  });
}

module.exports = {
  AI_UNAVAILABLE_MESSAGE,
  providerStatus,
  runStructured,
  generateCareerExplanation,
  generateLearningRecommendations,
  generateLearningRoadmap,
  analyzeResumeText,
};
