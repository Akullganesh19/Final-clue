import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.ts';

test('Delimiter collision in generateAuditHash', () => {
  const hash1 = generateAuditHash('PREV', 'LOGIN', 'user|admin', 'sys', '2023');
  const hash2 = generateAuditHash('PREV', 'LOGIN|user', 'admin', 'sys', '2023');
  assert.notStrictEqual(hash1, hash2, 'Hashes should not match');
});

test('ID collision in createAuditLog', () => {
  const originalRandom = Math.random;
  const originalNow = Date.now;
  Math.random = () => 0.5;
  Date.now = () => 1000;

  const log1 = createAuditLog([], 'A', 'A');
  const log2 = createAuditLog([], 'B', 'B');

  assert.notStrictEqual(log1[0].id, log2[0].id, 'IDs should not match');

  Math.random = originalRandom;
  Date.now = originalNow;
});
