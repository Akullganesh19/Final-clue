import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Audit Ledger - Idempotency Guard', () => {
  it('should add a log if idempotency key is unique', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(logs, 'LOGIN', 'User logged in', 'idempotency-key-1');
    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].action, 'LOGIN');
    assert.strictEqual(newLogs[0].idempotencyKey, 'idempotency-key-1');
  });

  it('should prevent duplicate logs with same idempotency key', () => {
    const logs: AuditTrail[] = [];
    const logsAfterFirst = createAuditLog(logs, 'LOGIN', 'User logged in', 'idempotency-key-2');
    assert.strictEqual(logsAfterFirst.length, 1);

    // Override console.warn to capture the warning
    let warningFired = false;
    const originalWarn = console.warn;
    console.warn = (msg) => {
      if (msg.includes('Idempotency guard fired')) {
        warningFired = true;
      }
    };

    const logsAfterSecond = createAuditLog(logsAfterFirst, 'LOGIN', 'User logged in', 'idempotency-key-2');

    console.warn = originalWarn; // Restore original console.warn

    assert.strictEqual(logsAfterSecond.length, 1, 'Length should remain 1');
    assert.strictEqual(logsAfterSecond, logsAfterFirst, 'Should return the exact same array reference');
    assert.strictEqual(warningFired, true, 'Warning should have fired');
  });

  it('should throw an error if idempotency key is missing', () => {
    const logs: AuditTrail[] = [];
    assert.throws(
      () => {
        // @ts-ignore: Intentionally testing missing key at runtime
        createAuditLog(logs, 'LOGIN', 'User logged in', '');
      },
      /idempotencyKey is required for audit logs/
    );
  });
});
