import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2 } from './audit.ts';

test('generateAuditHash is vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'CREATE|User', 'Admin', 'System', '2023-10-10');
  const hash2 = generateAuditHash('PREV', 'CREATE', 'User|Admin', 'System', '2023-10-10');
  assert.strictEqual(hash1, hash2, 'Hashes should match due to delimiter injection');
});

test('generateAuditHashV2 is NOT vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHashV2('PREV', 'CREATE|User', 'Admin', 'System', '2023-10-10');
  const hash2 = generateAuditHashV2('PREV', 'CREATE', 'User|Admin', 'System', '2023-10-10');
  assert.notStrictEqual(hash1, hash2, 'Hashes should NOT match because of structured serialization');
});
