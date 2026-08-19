import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2 } from './src/utils/audit.js';

test('generateAuditHash is vulnerable to delimiter injection', () => {
  const prev = 'CHK-ROOT';
  const time = '2023-10-01T12:00:00.000Z';
  const hash1 = generateAuditHash(prev, 'CREATE', 'FILE', 'admin|user', time);
  const hash2 = generateAuditHash(prev, 'CREATE|FILE', 'admin', 'user', time);
  assert.strictEqual(hash1, hash2, 'Hashes should be identical due to vulnerability');
});

test('generateAuditHashV2 is NOT vulnerable to delimiter injection', () => {
  const prev = 'CHK-ROOT';
  const time = '2023-10-01T12:00:00.000Z';
  const hash1 = generateAuditHashV2(prev, 'CREATE', 'FILE', 'admin|user', time);
  const hash2 = generateAuditHashV2(prev, 'CREATE|FILE', 'admin', 'user', time);
  assert.notStrictEqual(hash1, hash2, 'Hashes must differ for different inputs');
});
