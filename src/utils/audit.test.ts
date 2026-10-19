import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog idempotency: deduplicates identical operations with the same idempotency key', () => {
  const initialLogs: AuditTrail[] = [];

  // First attempt
  const logsAfterFirstAttempt = createAuditLog(
    initialLogs,
    'CREATE_EVIDENCE',
    'Added bloody glove to evidence vault',
    'idemp-key-123'
  );

  assert.strictEqual(logsAfterFirstAttempt.length, 1);
  assert.strictEqual(logsAfterFirstAttempt[0].idempotencyKey, 'idemp-key-123');

  // Second attempt (simulating retry / double webhook / concurrency)
  const logsAfterSecondAttempt = createAuditLog(
    logsAfterFirstAttempt,
    'CREATE_EVIDENCE',
    'Added bloody glove to evidence vault',
    'idemp-key-123'
  );

  // Assert that no duplicate log was appended
  assert.strictEqual(logsAfterSecondAttempt.length, 1);

  // Assert that the exact same array reference was returned
  assert.strictEqual(logsAfterSecondAttempt, logsAfterFirstAttempt);
});

test('createAuditLog: appends different operations successfully', () => {
  const initialLogs: AuditTrail[] = [];

  const logsAttempt1 = createAuditLog(
    initialLogs,
    'CREATE_EVIDENCE',
    'Evidence A',
    'idemp-key-1'
  );

  const logsAttempt2 = createAuditLog(
    logsAttempt1,
    'CREATE_EVIDENCE',
    'Evidence B',
    'idemp-key-2'
  );

  assert.strictEqual(logsAttempt2.length, 2);
  assert.strictEqual(logsAttempt2[1].idempotencyKey, 'idemp-key-2');
});
