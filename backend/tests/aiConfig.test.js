'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { env } = require('../src/config/env');
const nvidiaAdapter = require('../src/services/ai/adapters/nvidia');
const openRouterAdapter = require('../src/services/ai/adapters/openrouter');
const {
  validateStructured,
  careerExplanationSchema,
  roadmapSchema,
} = require('../src/services/ai/validate');

test('AI Config: Default OpenRouter model is openrouter/free', () => {
  // If not overridden in current environment, default must be openrouter/free
  if (!process.env.OPENROUTER_MODEL) {
    assert.equal(env.openRouterModel, 'openrouter/free');
  } else {
    assert.ok(env.openRouterModel, 'OPENROUTER_MODEL is configured');
  }
});

test('AI Config: NVIDIA adapter is optional and does not crash when disabled', () => {
  // NVIDIA is optional; if nvidiaKey or nvidiaModel is blank, isConfigured() is false
  const prevKey = env.nvidiaKey;
  const prevModel = env.nvidiaModel;

  try {
    env.nvidiaKey = '';
    env.nvidiaModel = '';
    assert.equal(nvidiaAdapter.isConfigured(), false);

    // Should not throw or crash on check
    assert.doesNotThrow(() => {
      nvidiaAdapter.isConfigured();
    });
  } finally {
    env.nvidiaKey = prevKey;
    env.nvidiaModel = prevModel;
  }
});

test('AI Structured Output: Validates conformant JSON schema', () => {
  const validJson = JSON.stringify({
    summary: 'The candidate displays strong foundational alignment with software development.',
    strengths: ['JavaScript', 'HTML5', 'Git'],
    gaps: ['Docker', 'Kubernetes'],
    recommendations: ['Build containerized applications', 'Explore CI/CD workflows'],
  });

  const res = validateStructured(careerExplanationSchema, validJson);
  assert.equal(res.ok, true);
  assert.equal(res.data.strengths.length, 3);
  assert.equal(res.data.gaps.length, 2);
});

test('AI Structured Output: Strips markdown code blocks before validation', () => {
  const markdownFenced = `\`\`\`json
{
  "summary": "Solid cloud architecture foundations.",
  "strengths": ["AWS", "Terraform"],
  "gaps": ["GCP"],
  "recommendations": ["Study multi-cloud strategies"]
}
\`\`\``;

  const res = validateStructured(careerExplanationSchema, markdownFenced);
  assert.equal(res.ok, true);
  assert.equal(res.data.strengths[0], 'AWS');
});

test('AI Structured Output: Rejects malformed JSON and schema mismatches gracefully', () => {
  // Malformed JSON
  const brokenJson = '{ summary: "Unclosed json... ';
  const res1 = validateStructured(careerExplanationSchema, brokenJson);
  assert.equal(res1.ok, false);
  assert.equal(res1.reason, 'malformed');

  // Schema mismatch (missing required summary, wrong types)
  const invalidSchema = JSON.stringify({
    wrongField: 123,
  });
  const res2 = validateStructured(careerExplanationSchema, invalidSchema);
  assert.equal(res2.ok, false);
  assert.equal(res2.reason, 'invalid_structure');
});
