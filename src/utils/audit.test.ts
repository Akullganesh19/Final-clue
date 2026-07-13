import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog idempotency', () => {
  let logs: AuditTrail[] = [];
  logs = createAuditLog(logs, 'LOGIN', 'User logged in', 'Arjun Som'); // No idempotency key
  assert.strictEqual(logs.length, 1);

  // If retried with idempotency key, it should deduplicate
  const key = 'req-123';
  logs = createAuditLog(logs, 'LOGIN', 'User logged in', 'Arjun Som', key);
  assert.strictEqual(logs.length, 2);

  const logs2 = createAuditLog(logs, 'LOGIN', 'User logged in', 'Arjun Som', key);
  assert.strictEqual(logs2.length, 2);
  assert.strictEqual(logs, logs2); // Should return unmodified state reference
});
