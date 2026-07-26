import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.js';

test('generateAuditHash is not vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'LOGIN', 'user|admin', 'system', '2023-01-01');
  const hash2 = generateAuditHash('PREV', 'LOGIN|user', 'admin', 'system', '2023-01-01');

  assert.notStrictEqual(hash1, hash2, 'Delimiter injection should result in different hashes');
});

test('createAuditLog uses cryptographically secure random UUIDs to avoid concurrency collisions', () => {
  const log1 = createAuditLog([], 'TEST', 'TEST', 'TEST');
  const log2 = createAuditLog([], 'TEST', 'TEST', 'TEST');

  assert.notStrictEqual(log1[0].id, log2[0].id, 'IDs must be unique');
  assert.match(log1[0].id, /^AUDIT-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'ID must be a UUID');
});
