import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('createAuditLog', () => {
  it('appends a new log when idempotencyKey is unique', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(logs, 'LOGIN', 'User logged in', 'key-1');
    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].idempotencyKey, 'key-1');
  });

  it('returns original logs and warns on duplicate idempotencyKey', () => {
    const logs: AuditTrail[] = [];
    let warnFired = false;
    const originalWarn = console.warn;
    console.warn = () => { warnFired = true; };

    const logsStep1 = createAuditLog(logs, 'LOGIN', 'User logged in', 'duplicate-key');
    const logsStep2 = createAuditLog(logsStep1, 'LOGIN', 'User logged in again', 'duplicate-key');

    console.warn = originalWarn;

    assert.strictEqual(warnFired, true);
    assert.strictEqual(logsStep1, logsStep2);
    assert.strictEqual(logsStep2.length, 1);
  });
});
