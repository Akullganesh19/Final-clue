import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit.js';
import { AuditTrail } from '../types.js';

test('createAuditLog prevents read-modify-write drift (OCC)', async () => {
  let backendDb: AuditTrail[] = [];

  // Simulate async operation that reads state, delays, and writes back
  async function asyncAppendLog(action: string, details: string) {
    // 1. Read current state
    const currentLogs = [...backendDb];
    const expectedLength = currentLogs.length;

    // 2. Yield to event loop (simulate DB latency)
    await new Promise(resolve => setTimeout(resolve, 10));

    // 3. Attempt to append using the expected length on the CURRENT backend state
    const newLogs = createAuditLog(backendDb, action, details, "System", undefined, expectedLength);

    // 4. Write back
    backendDb = newLogs;
  }

  // We start both async appends at the exact same time
  const p1 = asyncAppendLog('ACTION_1', 'detail 1');
  const p2 = asyncAppendLog('ACTION_2', 'detail 2');

  // One will succeed, the other will fail because it's reading an outdated length
  let errors = 0;
  try {
    await Promise.all([p1, p2]);
  } catch (e: any) {
    assert.match(e.message, /OCC Drift detected:/);
    errors++;
  }

  assert.strictEqual(errors, 1);
  assert.strictEqual(backendDb.length, 1);
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
