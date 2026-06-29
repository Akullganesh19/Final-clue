import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit.js';

test('generateAuditHash delimiter injection vulnerability', () => {
  const hash1 = generateAuditHash('prev', 'action|with', 'details', 'author', 'time');
  const hash2 = generateAuditHash('prev', 'action', 'with|details', 'author', 'time');

  // If the vulnerability is fixed, they must produce distinct hashes
  assert.notStrictEqual(hash1, hash2);
});
