'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const validators = require('../src/services/ai/validate');
const { runStructured, AI_UNAVAILABLE_MESSAGE } = require('../src/services/ai');

describe('AI Validation & Fallback Architecture', () => {
  test('validates valid structured output successfully', () => {
    const jsonStr = JSON.stringify({
      summary: 'Strong match for software developer.',
      strengths: ['JavaScript', 'HTML'],
      gaps: ['Docker'],
      recommendations: ['Learn containerization.'],
    });

    const result = validators.validateStructured(validators.careerExplanationSchema, jsonStr);
    assert.equal(result.ok, true);
    assert.equal(result.data.summary, 'Strong match for software developer.');
    assert.equal(result.data.strengths.length, 2);
  });

  test('extracts JSON when wrapped inside markdown code fences', () => {
    const fenced = '```json\n{"summary": "Looks good", "strengths": [], "gaps": [], "recommendations": []}\n```';
    const result = validators.validateStructured(validators.careerExplanationSchema, fenced);
    assert.equal(result.ok, true);
    assert.equal(result.data.summary, 'Looks good');
  });

  test('rejects malformed non-JSON output', () => {
    const invalid = 'Not a json response';
    const result = validators.validateStructured(validators.careerExplanationSchema, invalid);
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'malformed');
  });

  test('rejects JSON missing required fields', () => {
    const missingFields = JSON.stringify({
      strengths: ['JavaScript'],
    });
    const result = validators.validateStructured(validators.careerExplanationSchema, missingFields);
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'invalid_structure');
  });

  test('falls back gracefully without throwing unhandled exceptions', async () => {
    // Calling runStructured with an impossible-to-satisfy schema or failing mock
    const fallback = await runStructured({
      schema: validators.careerExplanationSchema,
      prompt: 'test prompt',
      system: 'test system',
    });

    // Regardless of whether OpenRouter is live or network times out, runStructured returns { available: boolean }
    assert.ok(typeof fallback.available === 'boolean');
    if (!fallback.available) {
      assert.equal(fallback.message, AI_UNAVAILABLE_MESSAGE);
    }
  });
});
