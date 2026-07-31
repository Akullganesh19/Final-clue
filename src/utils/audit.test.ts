import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.js';

test('generateAuditHash produces consistent SHA-256 hashes', async () => {
  const hash1 = await generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  const hash2 = await generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.strictEqual(hash1, hash2);
  assert.ok(hash1.startsWith('CHK-'));
  assert.ok(hash1.length > 32); // SHA-256 is 64 hex chars + 4 for CHK-
});

test('createAuditLog appends new log with valid UUID and hash', async () => {
  const logs = await createAuditLog([], 'START', 'Test details');
  assert.strictEqual(logs.length, 1);
  assert.ok(logs[0].id.startsWith('AUDIT-'));
  assert.ok(logs[0].hash.startsWith('CHK-'));
});
