import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js'; // Use .js extension for ESM resolution in node
import { AuditTrail } from '../types.js';

test('createAuditLog is idempotent when given the same idempotencyKey', () => {
  const initialLogs: AuditTrail[] = [];

  // First call
  const idempotencyKey = 'req-12345';
  const logsAfterFirstCall = createAuditLog(
    initialLogs,
    'TEST_ACTION',
    'Some details',
    idempotencyKey,
    'Tester'
  );

  assert.strictEqual(logsAfterFirstCall.length, 1);
  assert.strictEqual(logsAfterFirstCall[0].idempotencyKey, idempotencyKey);

  // Second call with the same idempotency key
  const logsAfterSecondCall = createAuditLog(
    logsAfterFirstCall,
    'TEST_ACTION',
    'Some details',
    idempotencyKey,
    'Tester'
  );

  // The array reference should be identical (strictly equal) indicating no operation occurred
  assert.strictEqual(logsAfterSecondCall, logsAfterFirstCall);
  assert.strictEqual(logsAfterSecondCall.length, 1);
});
