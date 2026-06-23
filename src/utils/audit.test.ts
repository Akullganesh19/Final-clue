import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';

describe('Audit Trail', () => {
  it('should create an initial log', () => {
    const logs = createAuditLog([], 'START', 'Started case');
    assert.strictEqual(logs.length, 1);
    assert.ok(logs[0].hash.startsWith('CHK-'));
  });

  it('should append a log with the correct parent hash', () => {
    const logs = createAuditLog([], 'START', 'Started case');
    const firstHash = logs[0].hash;
    const newLogs = createAuditLog(logs, 'UPDATE', 'Updated case', 'User', firstHash);

    assert.strictEqual(newLogs.length, 2);
  });

  it('should throw an error on concurrent write if expectedParentHash is provided and mismatched', () => {
    const logs = createAuditLog([], 'START', 'Started case');
    const firstHash = logs[0].hash;

    // Simulate concurrent read
    const clientALogs = [...logs];

    // Client A writes successfully
    const updatedByA = createAuditLog(clientALogs, 'A', 'Action A', 'User A', firstHash);

    // Client B tries to write to the updated log, but using the old expectedParentHash
    // (This simulates B passing expectedParentHash = firstHash against the NEW state updatedByA)
    assert.throws(() => {
      createAuditLog(updatedByA, 'B', 'Action B', 'User B', firstHash);
    }, /Concurrency error/);
  });

  it('should pass if expectedParentHash matches', () => {
    const logs = createAuditLog([], 'START', 'Started case');
    const firstHash = logs[0].hash;

    // Pass expectedParentHash that matches
    const nextLogs = createAuditLog(logs, 'B', 'Action B', 'User B', firstHash);
    assert.strictEqual(nextLogs.length, 2);
  });
});
