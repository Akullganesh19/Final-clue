import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.ts';
import { AuditTrail } from '../types.ts';

test('createAuditLog adds a new log when idempotencyKey is unique', () => {
  const initialLogs: AuditTrail[] = [];
  const result = createAuditLog(initialLogs, 'TEST_ACTION', 'Test details', 'key-1');

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].action, 'TEST_ACTION');
  assert.strictEqual(result[0].idempotencyKey, 'key-1');
});

test('createAuditLog returns the exact same array reference if idempotencyKey is a duplicate', () => {
  const initialLogs: AuditTrail[] = [];
  const logs1 = createAuditLog(initialLogs, 'TEST_ACTION_1', 'Test details 1', 'key-dup');

  assert.strictEqual(logs1.length, 1);

  // Try to add another log with the same idempotency key
  const logs2 = createAuditLog(logs1, 'TEST_ACTION_2', 'Test details 2', 'key-dup');

  // The array length should still be 1 (deduplicated)
  assert.strictEqual(logs2.length, 1);

  // It should return the exact same array reference
  assert.strictEqual(logs1, logs2);

  // The content should be from the first action
  assert.strictEqual(logs2[0].action, 'TEST_ACTION_1');
});
