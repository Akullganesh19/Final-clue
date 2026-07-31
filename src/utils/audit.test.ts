import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit.js';

test('generateAuditHash does not collide on shifted pipe characters', () => {
  const hash1 = generateAuditHash('PREV', 'LOGIN', 'SUCCESS|IP', 'Admin', 'TIME');
  const hash2 = generateAuditHash('PREV', 'LOGIN|SUCCESS', 'IP', 'Admin', 'TIME');

  assert.notStrictEqual(hash1, hash2, 'Hash collision detected: separator injection allowed identical hashes for different inputs.');
});
