import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, generateAuditHash } from './audit';
import { AuditTrail } from '../types';

test('Audit log idempotency', () => {
  let logs: AuditTrail[] = [];
  logs = createAuditLog(logs, 'ACTION', 'Details', 'Author', 'idemp-1');
  const firstLen = logs.length;
  logs = createAuditLog(logs, 'ACTION', 'Details', 'Author', 'idemp-1');
  assert.strictEqual(logs.length, firstLen, 'Should not add duplicate log with same idempotencyKey');
});

test('Audit hash collision prevention', () => {
  const hash1 = generateAuditHash('PREV', 'UPDATE_ROLE', 'admin|admin', 'user', '2023-01-01');
  const hash2 = generateAuditHash('PREV', 'UPDATE_ROLE|admin', 'admin', 'user', '2023-01-01');
  assert.notStrictEqual(hash1, hash2, 'Hashes should not collide on delimiter injection');
});
