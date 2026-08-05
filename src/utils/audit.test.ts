import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2 } from './audit.js';

test('V1 Hash is vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'LOGIN', 'user|admin', 'system', '2023-01-01');
  const hash2 = generateAuditHash('PREV', 'LOGIN|user', 'admin', 'system', '2023-01-01');
  assert.strictEqual(hash1, hash2);
});

test('V2 Hash is not vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHashV2('PREV', 'LOGIN', 'user|admin', 'system', '2023-01-01');
  const hash2 = generateAuditHashV2('PREV', 'LOGIN|user', 'admin', 'system', '2023-01-01');
  assert.notStrictEqual(hash1, hash2);
});
