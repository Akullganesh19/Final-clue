import test, { mock } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';

test('createAuditLog simulates double execution drift without idempotency', async (t) => {
  let logs: any[] = [];

  // Simulate original request
  logs = createAuditLog(logs, 'ACTION', 'details', 'Agent', 'op-123');
  assert.strictEqual(logs.length, 1);

  // Simulate retried request (drift occurs if not guarded)
  logs = createAuditLog(logs, 'ACTION', 'details', 'Agent', 'op-123');

  // Before fix, this fails as length will be 2
  assert.strictEqual(logs.length, 1, 'Expected idempotency guard to prevent duplicate log');
});

test('createAuditLog clears idempotency cache after TTL', async (t) => {
  mock.timers.enable({ apis: ['setTimeout'] });
  let logs: any[] = [];

  logs = createAuditLog(logs, 'ACTION_TTL', 'details', 'Agent', 'op-ttl');
  assert.strictEqual(logs.length, 1);

  // Still within TTL
  logs = createAuditLog(logs, 'ACTION_TTL', 'details', 'Agent', 'op-ttl');
  assert.strictEqual(logs.length, 1);

  // Advance time past TTL (10 seconds)
  mock.timers.tick(11000);

  logs = createAuditLog(logs, 'ACTION_TTL', 'details', 'Agent', 'op-ttl');
  assert.strictEqual(logs.length, 2, 'Expected new log after TTL expired');

  mock.timers.reset();
});
