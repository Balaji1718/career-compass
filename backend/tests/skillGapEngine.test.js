'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/services/skillGapEngine');

test('SkillGapEngine: 100% complete match calculates score 100 and Strong Match', () => {
  const requirements = [
    {
      skillId: 's1',
      skillName: 'JavaScript',
      minimumLevel: 3,
      importance: 5,
      priority: 5,
      requirementType: 'required',
      isCore: true,
    },
    {
      skillId: 's2',
      skillName: 'React',
      minimumLevel: 2,
      importance: 3,
      priority: 3,
      requirementType: 'required',
      isCore: true,
    },
  ];

  const userSkills = new Map([
    ['s1', 3],
    ['s2', 2],
  ]);

  const result = engine.analyseCareer(requirements, userSkills);
  assert.equal(result.overallMatchScore, 100);
  assert.equal(result.matchClassification, 'Strong Match');
  assert.equal(result.missingSkills.length, 0);
  assert.equal(result.matchedSkills.length, 2);
  assert.equal(result.skillCoverage, 100);
});

test('SkillGapEngine: Zero skills yields 0 score and Low Match', () => {
  const requirements = [
    {
      skillId: 's1',
      skillName: 'Python',
      minimumLevel: 3,
      importance: 5,
      priority: 5,
      requirementType: 'required',
      isCore: true,
    },
  ];

  const userSkills = new Map();
  const result = engine.analyseCareer(requirements, userSkills);
  assert.equal(result.overallMatchScore, 0);
  assert.equal(result.matchClassification, 'Low Match');
  assert.equal(result.missingSkills.length, 1);
  assert.equal(result.matchedSkills.length, 0);
});

test('SkillGapEngine: Classifies bands properly (Strong, Moderate, Partial, Low)', () => {
  assert.equal(engine.classifyScore(95), 'Strong Match');
  assert.equal(engine.classifyScore(80), 'Strong Match');
  assert.equal(engine.classifyScore(75), 'Moderate Match');
  assert.equal(engine.classifyScore(60), 'Moderate Match');
  assert.equal(engine.classifyScore(55), 'Partial Match');
  assert.equal(engine.classifyScore(40), 'Partial Match');
  assert.equal(engine.classifyScore(35), 'Low Match');
  assert.equal(engine.classifyScore(0), 'Low Match');
});

test('SkillGapEngine: Weak skills below required level calculate proportional value', () => {
  const requirements = [
    {
      skillId: 's1',
      skillName: 'TypeScript',
      minimumLevel: 4,
      importance: 4,
      priority: 4,
      requirementType: 'required',
      isCore: true,
    },
  ];

  // User has level 2 of 4 (50%)
  const userSkills = new Map([['s1', 2]]);
  const result = engine.analyseCareer(requirements, userSkills);

  assert.equal(result.overallMatchScore, 50);
  assert.equal(result.weakSkills.length, 1);
  assert.equal(result.weakSkills[0].gap, 2);
});
