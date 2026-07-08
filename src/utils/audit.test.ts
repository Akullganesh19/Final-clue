import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog idempotency', async (t) => {
  await t.test('should append a new log if no idempotency key is provided', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(logs, 'VIEW_CASE', 'Viewed case 123');
    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].action, 'VIEW_CASE');
  });

  await t.test('should append a new log if idempotency key is provided but does not exist', () => {
    const logs: AuditTrail[] = [];
    const idempotencyKey = 'req-12345';
    const newLogs = createAuditLog(logs, 'UPDATE_STATUS', 'Updated status to cold', undefined, idempotencyKey);
    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].idempotencyKey, idempotencyKey);
  });

  await t.test('should NOT append a new log if idempotency key already exists (retry/duplicate scenario)', () => {
    const idempotencyKey = 'req-67890';
    const logs: AuditTrail[] = [
      {
        id: 'AUDIT-123',
        timestamp: new Date().toISOString(),
        action: 'DELETE_EVIDENCE',
        details: 'Deleted evidence item 42',
        author: 'Investigator',
        idempotencyKey
      }
    ];

    // Simulate a retry of the same operation
    const newLogs = createAuditLog(logs, 'DELETE_EVIDENCE', 'Deleted evidence item 42', undefined, idempotencyKey);

    // The length should remain 1, proving idempotency
    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs, logs); // Should return the exact same array reference
  });
});
