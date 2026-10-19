import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Audit Log - Optimistic Concurrency Control', () => {
  it('should prevent concurrent updates that would cause silent drift', () => {
    // Initial state
    const initialLogs: AuditTrail[] = [];
    const logsAfterFirst = createAuditLog(initialLogs, 'INIT', 'Initial log');

    // Simulate two concurrent operations reading the same state
    const user1ReadState = [...logsAfterFirst];
    const user2ReadState = [...logsAfterFirst];

    const expectedHashUser1 = user1ReadState[user1ReadState.length - 1]?.hash;

    const logsAfterUser1 = createAuditLog(user1ReadState, 'UPDATE_A', 'User 1 update', 'User 1', expectedHashUser1);

    const actualSystemState = [...logsAfterUser1];

    const expectedHashUser2 = user2ReadState[user2ReadState.length - 1]?.hash;

    // We expect this to throw a Concurrency mismatch error because actualSystemState has advanced
    assert.throws(
      () => {
        createAuditLog(actualSystemState, 'UPDATE_B', 'User 2 update', 'User 2', expectedHashUser2);
      },
      /Concurrency mismatch/
    );
  });

  it('should append sequentially successfully', () => {
    const initialLogs: AuditTrail[] = [];
    const logs1 = createAuditLog(initialLogs, 'INIT', 'Initial log', undefined, undefined);

    const expectedHash1 = logs1[logs1.length - 1]?.hash;
    const logs2 = createAuditLog(logs1, 'STEP1', 'Step 1', 'User 1', expectedHash1);

    assert.strictEqual(logs2.length, 2);
    assert.strictEqual(logs2[1].action, 'STEP1');

    // Works without expected hash as well (backward compatibility)
    const logs3 = createAuditLog(logs2, 'STEP2', 'Step 2');
    assert.strictEqual(logs3.length, 3);
  });
});
