import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.ts';
import { AuditTrail } from '../types.ts';

test('createAuditLog should not duplicate logs for the same idempotency key', () => {
  let logs: AuditTrail[] = [];
  logs = createAuditLog(logs, 'LOGIN', 'User logged in', 'System', 'login-request-123');
  const firstLogCount = logs.length;
  logs = createAuditLog(logs, 'LOGIN', 'User logged in', 'System', 'login-request-123');

  assert.strictEqual(logs.length, firstLogCount, 'Log count should not increase on duplicate idempotency key');
});
