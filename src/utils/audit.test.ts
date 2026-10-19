import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';

describe('Audit Ledger Idempotency', () => {
  it('should return a new log if no idempotency key is provided', () => {
    const logs = [];
    const updatedLogs = createAuditLog(logs, 'ACTION', 'Details', 'Author');
    assert.strictEqual(updatedLogs.length, 1);
    assert.strictEqual(updatedLogs[0].action, 'ACTION');
  });

  it('should add a log with an idempotency key', () => {
    const logs = [];
    const updatedLogs = createAuditLog(logs, 'ACTION', 'Details', 'Author', 'key-123');
    assert.strictEqual(updatedLogs.length, 1);
    assert.strictEqual(updatedLogs[0].idempotencyKey, 'key-123');
  });

  it('should return the unmodified logs reference if the idempotency key already exists', () => {
    const logs = [];
    const initialLogs = createAuditLog(logs, 'ACTION', 'Details', 'Author', 'key-123');
    const updatedLogs = createAuditLog(initialLogs, 'ACTION', 'Details', 'Author', 'key-123');

    // Deduplication should occur
    assert.strictEqual(updatedLogs.length, 1);

    // Exact reference should be returned
    assert.strictEqual(initialLogs, updatedLogs);
  });

  it('should allow different idempotency keys', () => {
    const logs = [];
    const initialLogs = createAuditLog(logs, 'ACTION', 'Details', 'Author', 'key-123');
    const updatedLogs = createAuditLog(initialLogs, 'ACTION2', 'Details2', 'Author2', 'key-456');

    assert.strictEqual(updatedLogs.length, 2);
    assert.strictEqual(updatedLogs[0].idempotencyKey, 'key-123');
    assert.strictEqual(updatedLogs[1].idempotencyKey, 'key-456');
  });
});
