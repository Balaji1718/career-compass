'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { Roadmap } = require('../src/models');

describe('Roadmap Progress & Logic', () => {
  test('recalculates progress and status accurately on stage completion', () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
      analysisId: new mongoose.Types.ObjectId(),
      careerId: new mongoose.Types.ObjectId(),
      title: 'Full Stack Learning Roadmap',
      stages: [
        { stageNumber: 1, title: 'Learn JS', estimatedHours: 20, completed: false },
        { stageNumber: 2, title: 'Learn Node', estimatedHours: 30, completed: false },
        { stageNumber: 3, title: 'Learn React', estimatedHours: 25, completed: false },
        { stageNumber: 4, title: 'Deploy App', estimatedHours: 15, completed: false },
      ],
    });

    roadmap.recalculateProgress();
    assert.equal(roadmap.progressPercentage, 0);
    assert.equal(roadmap.status, 'not_started');
    assert.equal(roadmap.totalEstimatedHours, 90);

    // Complete 2 out of 4 stages -> 50%
    roadmap.stages[0].completed = true;
    roadmap.stages[1].completed = true;
    roadmap.recalculateProgress();
    assert.equal(roadmap.progressPercentage, 50);
    assert.equal(roadmap.status, 'in_progress');

    // Complete all 4 stages -> 100%
    roadmap.stages[2].completed = true;
    roadmap.stages[3].completed = true;
    roadmap.recalculateProgress();
    assert.equal(roadmap.progressPercentage, 100);
    assert.equal(roadmap.status, 'completed');
  });

  test('handles empty stages gracefully without NaN', () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId(),
      analysisId: new mongoose.Types.ObjectId(),
      careerId: new mongoose.Types.ObjectId(),
      title: 'Empty Roadmap',
      stages: [],
    });

    roadmap.recalculateProgress();
    assert.equal(roadmap.progressPercentage, 0);
    assert.equal(roadmap.totalEstimatedHours, 0);
    assert.equal(roadmap.status, 'not_started');
  });
});
