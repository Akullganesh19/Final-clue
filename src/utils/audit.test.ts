import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit.js';

test('Audit hash delimiter injection vulnerability', () => {
  // Scenario 1
  const hash1 = generateAuditHash('PREV', 'ACTION|EXTRA', 'DETAILS', 'AUTHOR', 'TIME');
  // Scenario 2
  const hash2 = generateAuditHash('PREV', 'ACTION', 'EXTRA|DETAILS', 'AUTHOR', 'TIME');

  assert.notStrictEqual(hash1, hash2, 'Hashes should not match for different semantic inputs');
});
