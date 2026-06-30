import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateSecureAuditHash, createSecureAuditLog, generateAuditHash, createAuditLog } from './audit';

test('Audit Trail - Legacy functions are still functional', () => {
  const hash = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.ok(hash.startsWith('CHK-'));

  const log = createAuditLog([], 'ACTION', 'DETAILS', 'AUTHOR');
  assert.strictEqual(log.length, 1);
  assert.ok(log[0].id.startsWith('AUDIT-'));
  assert.strictEqual(log[0].action, 'ACTION');
});

test('Audit Trail - Secure Web Crypto API functions work properly', async () => {
  const hash = await generateSecureAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.ok(hash.startsWith('SHA256-'));
  // SHA256 hex string is 64 characters long + 7 chars for 'SHA256-'
  assert.strictEqual(hash.length, 71);

  const logs = await createSecureAuditLog([], 'ACTION_1', 'DETAILS_1', 'AUTHOR_1');
  assert.strictEqual(logs.length, 1);

  const firstLog = logs[0];
  assert.ok(firstLog.id.startsWith('AUDIT-'));
  // UUIDv4 length is 36
  assert.strictEqual(firstLog.id.length, 6 + 36);
  assert.strictEqual(firstLog.action, 'ACTION_1');
  assert.ok(firstLog.hash.startsWith('SHA256-'));

  const extendedLogs = await createSecureAuditLog(logs, 'ACTION_2', 'DETAILS_2', 'AUTHOR_2');
  assert.strictEqual(extendedLogs.length, 2);

  const secondLog = extendedLogs[1];
  assert.strictEqual(secondLog.action, 'ACTION_2');

  // Verify deterministic hashing - identical inputs should yield identical hashes
  const hash1 = await generateSecureAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  const hash2 = await generateSecureAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.strictEqual(hash1, hash2);

  // Ensure we are resilient to delimiter injection
  // The old hash would produce the same result if we moved delimiters into the content
  // JSON serialization inherently protects against this by distinguishing array elements
  const maliciousHash = await generateSecureAuditHash('PREV|ACTION', '', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.notStrictEqual(hash1, maliciousHash);
});
