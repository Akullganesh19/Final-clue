import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('createAuditLog', () => {
  it('should create an audit log and deduplicate retries using the same idempotency key', () => {
    const logs: AuditTrail[] = [];
    const action = 'TEST_ACTION';
    const details = 'Test details';
    const idempotencyKey = 'key-123';

    // First call should create a log
    const updatedLogs1 = createAuditLog(logs, action, details, idempotencyKey);
    assert.equal(updatedLogs1.length, 1);
    assert.equal(updatedLogs1[0].action, action);
    assert.equal(updatedLogs1[0].details, details);
    assert.equal(updatedLogs1[0].idempotencyKey, idempotencyKey);

    // Second call with same idempotency key should deduplicate and return the same array
    const updatedLogs2 = createAuditLog(updatedLogs1, action, details, idempotencyKey);
    assert.equal(updatedLogs1, updatedLogs2, 'Arrays should be the same reference upon deduplication');
    assert.equal(updatedLogs2.length, 1, 'Array length should remain 1');
  });

  it('should throw an error if idempotencyKey is not provided', () => {
    const logs: AuditTrail[] = [];
    assert.throws(
      () => createAuditLog(logs, 'ACTION', 'details', ''),
      /idempotencyKey is required/
    );
  });
});
