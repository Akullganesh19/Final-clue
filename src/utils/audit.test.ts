import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit.js';

test('generateAuditHash', () => {
  const hash = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.ok(hash.startsWith('CHK-'));
});
