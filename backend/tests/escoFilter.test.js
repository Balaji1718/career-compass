'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isRelevantOccupation,
  mapRelation,
  categoryForTitle,
} = require('../src/seeds/escoConfig');

test('ESCO Filter: Rejects identified false-positive occupations', () => {
  const falsePositives = [
    { title: 'Auxiliary nursing and midwifery vocational teacher', iscoGroup: '2320' },
    { title: 'Audio-visual technician', iscoGroup: '3521' },
    { title: 'Boom operator', iscoGroup: '3521' },
    { title: 'Camera operator', iscoGroup: '3521' },
    { title: 'Performance rental technician', iscoGroup: '3521' },
    { title: 'Projectionist', iscoGroup: '3521' },
    { title: 'Recording studio technician', iscoGroup: '3521' },
    { title: 'Security alarm technician', iscoGroup: '7421' },
    { title: 'Sound operator', iscoGroup: '3521' },
    { title: 'Video technician', iscoGroup: '3521' },
    { title: 'Broadcast technician', iscoGroup: '3521' },
    { title: 'Stage lighting technician', iscoGroup: '3521' },
  ];

  for (const item of falsePositives) {
    const included = isRelevantOccupation(item);
    assert.equal(
      included,
      false,
      `Expected "${item.title}" (ISCO ${item.iscoGroup}) to be excluded from ICT occupations`
    );
  }
});

test('ESCO Filter: UX word boundary matching prevents substring collision with auxiliary', () => {
  // Auxiliary has 'ux' as substring; token-aware matching must reject it
  const auxiliaryTitle = { title: 'Auxiliary healthcare assistant', iscoGroup: '5321' };
  assert.equal(isRelevantOccupation(auxiliaryTitle), false);

  // Legitimate UX / User Experience titles must be included
  const uxRoles = [
    { title: 'UX designer', iscoGroup: '2513' },
    { title: 'User experience analyst', iscoGroup: '2512' },
    { title: 'User interface designer', iscoGroup: '2513' },
  ];

  for (const role of uxRoles) {
    assert.equal(
      isRelevantOccupation(role),
      true,
      `Expected legitimate UX role "${role.title}" to be included`
    );
    assert.equal(categoryForTitle(role.title), 'UI/UX');
  }
});

test('ESCO Filter: Preserves core ICT occupations', () => {
  const coreIct = [
    { title: 'Software developer', iscoGroup: '2512' },
    { title: 'Database administrator', iscoGroup: '2521' },
    { title: 'Cybersecurity specialist', iscoGroup: '2529' },
    { title: 'Cloud solutions architect', iscoGroup: '2511' },
    { title: 'DevOps engineer', iscoGroup: '2512' },
    { title: 'Web developer', iscoGroup: '2513' },
    { title: 'Data analyst', iscoGroup: '2512' },
    { title: 'Network administrator', iscoGroup: '2522' },
    { title: 'Quality assurance engineer', iscoGroup: '2519' },
    { title: 'Machine learning engineer', iscoGroup: '2512' },
  ];

  for (const role of coreIct) {
    assert.equal(
      isRelevantOccupation(role),
      true,
      `Expected core ICT occupation "${role.title}" to be included`
    );
  }
});

test('ESCO Heuristics: Clearly maps qualitative essential/optional to quantitative values', () => {
  const essentialResult = mapRelation('essential', 'skill');
  assert.equal(essentialResult.requirementType, 'required');
  assert.equal(essentialResult.minimumLevel, 3, 'Application heuristic: essential -> level 3');
  assert.equal(essentialResult.importance, 5, 'Application heuristic: essential -> importance 5');
  assert.equal(essentialResult.priority, 5, 'Application heuristic: essential -> priority 5');
  assert.equal(essentialResult.isCore, true);

  const optionalResult = mapRelation('optional', 'knowledge');
  assert.equal(optionalResult.requirementType, 'preferred');
  assert.equal(optionalResult.minimumLevel, 2, 'Application heuristic: optional -> level 2');
  assert.equal(optionalResult.importance, 2, 'Application heuristic: optional -> importance 2');
  assert.equal(optionalResult.priority, 2, 'Application heuristic: optional -> priority 2');
  assert.equal(optionalResult.isCore, false);
});
