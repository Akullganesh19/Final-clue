import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2 } from './audit.js';

test('generateAuditHash delimiter injection vulnerability', () => {
  const prevHash = 'CHK-123';
  const timestamp = '2023-01-01T00:00:00Z';

  const hash1 = generateAuditHash(prevHash, 'LOGIN', 'details|admin', 'sys', timestamp);
  const hash2 = generateAuditHash(prevHash, 'LOGIN|details', 'admin', 'sys', timestamp);
  assert.strictEqual(hash1, hash2, "Expected delimiter injection vulnerability in V1");
});

test('generateAuditHashV2 mitigates delimiter injection', () => {
  const prevHash = 'CHK-123';
  const timestamp = '2023-01-01T00:00:00Z';

  const hash3 = generateAuditHashV2(prevHash, 'LOGIN', 'details|admin', 'sys', timestamp);
  const hash4 = generateAuditHashV2(prevHash, 'LOGIN|details', 'admin', 'sys', timestamp);
  assert.notStrictEqual(hash3, hash4, "Expected no delimiter injection vulnerability in V2");
});
