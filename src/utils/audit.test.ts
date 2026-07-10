import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit.js';

test('generateAuditHash does not collide due to delimiter injection', () => {
  const hash1 = generateAuditHash('prev', 'action|foo', 'details', 'author', 'time');
  const hash2 = generateAuditHash('prev', 'action', 'foo|details', 'author', 'time');
  assert.notStrictEqual(hash1, hash2, 'Hashes should not collide on delimiter shift');
});
