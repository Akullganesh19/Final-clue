import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog prevents read-modify-write drift (OCC)', () => {
  const initialLogs: AuditTrail[] = [];
  const action = 'ADD_EVIDENCE';
  const details = 'Added gun to evidence locker';

  // Request A simulates reading initialLogs (length 0) and writing, expecting the length to be 0
  const logsAfterA = createAuditLog(initialLogs, action, details, undefined, undefined, 0);
  assert.strictEqual(logsAfterA.length, 1);

  // Request B simulates reading the *same* initialLogs simultaneously, expecting the length to be 0.
  // But wait, the truth array was already updated by Request A.
  // We simulate this by passing the actual state of the DB (logsAfterA) but the expected length of 0.
  assert.throws(
    () => {
      createAuditLog(logsAfterA, action, details, undefined, undefined, 0);
    },
    /OCC Drift detected: Expected log length 0 but found 1/
  );
});

test('createAuditLog prevents double-entry on retries (Idempotency)', () => {
  const initialLogs: AuditTrail[] = [];
  const action = 'UPDATE_STATUS';
  const details = 'Status changed to linked';
  const idempotencyKey = 'req-update-status-123';

  // First request succeeds
  const logsAfterFirst = createAuditLog(initialLogs, action, details, undefined, idempotencyKey);
  assert.strictEqual(logsAfterFirst.length, 1);
  assert.strictEqual(logsAfterFirst[0].idempotencyKey, idempotencyKey);

  // Second request (retry) with the same key should be a no-op, returning the unmodified array
  const logsAfterRetry = createAuditLog(logsAfterFirst, action, details, undefined, idempotencyKey);
  assert.strictEqual(logsAfterRetry.length, 1);
  assert.strictEqual(logsAfterRetry, logsAfterFirst); // Must return the exact same array reference
});
