import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2, createAuditLog } from './audit.ts';

test('generateAuditHash is vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'CREATE', 'user|ADMIN', 'AUTHOR', 'TIME');
  const hash2 = generateAuditHash('PREV', 'CREATE|user', 'ADMIN', 'AUTHOR', 'TIME');
  assert.strictEqual(hash1, hash2, 'Hashes should match demonstrating collision');
});

test('generateAuditHashV2 fixes delimiter injection using structured serialization', () => {
  const hash1 = generateAuditHashV2('PREV', 'CREATE', 'user|ADMIN', 'AUTHOR', 'TIME');
  const hash2 = generateAuditHashV2('PREV', 'CREATE|user', 'ADMIN', 'AUTHOR', 'TIME');
  assert.notStrictEqual(hash1, hash2, 'Hashes should not match');
});

test('createAuditLog uses generateAuditHashV2 and sets hashVersion', () => {
  const log = createAuditLog([], 'ACTION', 'DETAILS');
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].hashVersion, 2);
  assert.ok(log[0].hash.startsWith('CHK-V2-'));
});
