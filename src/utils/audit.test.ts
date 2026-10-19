import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuditLog } from './audit.ts';
import { AuditTrail } from '../types.ts';

test('createAuditLog creates a new log entry', () => {
  const initialLogs: AuditTrail[] = [];
  const logs = createAuditLog(initialLogs, 'LOGIN', 'User logged in', 'Arjun');

  assert.equal(logs.length, 1);
  assert.equal(logs[0].action, 'LOGIN');
  assert.equal(logs[0].author, 'Arjun');
  assert.equal(logs[0].idempotencyKey, undefined);
});

test('createAuditLog sets idempotency key when provided', () => {
  const initialLogs: AuditTrail[] = [];
  const logs = createAuditLog(initialLogs, 'LOGIN', 'User logged in', 'Arjun', 'login-id-123');

  assert.equal(logs.length, 1);
  assert.equal(logs[0].idempotencyKey, 'login-id-123');
});

test('createAuditLog avoids duplicates with idempotency guard', () => {
  const initialLogs: AuditTrail[] = [];

  // First call
  const logs1 = createAuditLog(initialLogs, 'PAYMENT', 'Payment processed', 'Arjun', 'payment-abc');
  assert.equal(logs1.length, 1);

  // Second call with same key
  const logs2 = createAuditLog(logs1, 'PAYMENT', 'Payment processed', 'Arjun', 'payment-abc');

  // Should return original array reference
  assert.equal(logs2, logs1);
  assert.equal(logs2.length, 1);
});

test('createAuditLog allows different actions with different idempotency keys', () => {
  const initialLogs: AuditTrail[] = [];

  const logs1 = createAuditLog(initialLogs, 'PAYMENT', 'Payment processed', 'Arjun', 'payment-abc');
  assert.equal(logs1.length, 1);

  const logs2 = createAuditLog(logs1, 'PAYMENT', 'Payment processed', 'Arjun', 'payment-def');
  assert.equal(logs2.length, 2);
});

test('createAuditLog allows same action without idempotency key', () => {
  const initialLogs: AuditTrail[] = [];

  const logs1 = createAuditLog(initialLogs, 'PAYMENT', 'Payment processed', 'Arjun');
  assert.equal(logs1.length, 1);

  const logs2 = createAuditLog(logs1, 'PAYMENT', 'Payment processed', 'Arjun');
  assert.equal(logs2.length, 2);
});
