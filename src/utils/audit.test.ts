import { test } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';
import { AuditTrail } from '../types.js';

test('Audit log with idempotencyKey prevents duplicate entries', () => {
  const initialLogs: AuditTrail[] = [];

  // First request succeeds
  const logs1 = createAuditLog(initialLogs, 'TEST_ACTION', 'Details', 'Arjun', 'IDEMP-123');
  assert.strictEqual(logs1.length, 1);

  // Second request with same idempotencyKey should return unmodified array
  const logs2 = createAuditLog(logs1, 'TEST_ACTION', 'Details', 'Arjun', 'IDEMP-123');
  assert.strictEqual(logs2.length, 1);
  assert.strictEqual(logs1, logs2);

  // Missing idempotency key allows duplicate actions
  const logs3 = createAuditLog(logs2, 'TEST_ACTION', 'Details');
  const logs4 = createAuditLog(logs3, 'TEST_ACTION', 'Details');
  assert.strictEqual(logs4.length, 3);
});
