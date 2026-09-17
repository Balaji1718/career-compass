'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { listQuerySchema } = require('../src/validators/schemas');
const { parsePagination, buildMeta } = require('../src/utils/pagination');

test('Career Discovery: listQuerySchema supports pagination and discovery limits up to 500', () => {
  // Query for discovering all careers in a single query
  const res1 = listQuerySchema.safeParse({ limit: 500, page: 1 });
  assert.equal(res1.success, true);
  assert.equal(res1.data.limit, 500);

  // Default limit fallback
  const resDefault = listQuerySchema.safeParse({});
  assert.equal(resDefault.success, true);
  assert.equal(resDefault.data.limit, 20);
  assert.equal(resDefault.data.page, 1);

  // Rejects invalid limits beyond 500
  const resOver = listQuerySchema.safeParse({ limit: 501 });
  assert.equal(resOver.success, false);

  // Rejects negative/zero limits
  const resUnder = listQuerySchema.safeParse({ limit: 0 });
  assert.equal(resUnder.success, false);
});

test('Career Discovery: listQuerySchema validates category and search term filters', () => {
  const parsed = listQuerySchema.safeParse({
    search: 'cloud architect',
    category: 'Cloud & DevOps',
    page: 2,
    limit: 40,
  });

  assert.equal(parsed.success, true);
  assert.equal(parsed.data.search, 'cloud architect');
  assert.equal(parsed.data.category, 'Cloud & DevOps');
  assert.equal(parsed.data.page, 2);
  assert.equal(parsed.data.limit, 40);
});

test('Career Discovery: buildMeta calculates multi-page discovery correctly', () => {
  const meta = buildMeta({ page: 2, limit: 40, total: 105 });
  assert.equal(meta.page, 2);
  assert.equal(meta.limit, 40);
  assert.equal(meta.total, 105);
  assert.equal(meta.totalPages, 3); // 40 + 40 + 25 = 3 pages
});

test('Career Discovery: parsePagination enforces safety bounds', () => {
  const p1 = parsePagination({ page: '1', limit: '40' });
  assert.equal(p1.page, 1);
  assert.equal(p1.limit, 40);
  assert.equal(p1.skip, 0);

  const p2 = parsePagination({ page: '-5', limit: '9999' });
  assert.equal(p2.page, 1);
  assert.equal(p2.limit, 500);
});
