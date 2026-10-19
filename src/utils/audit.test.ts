import { test } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog concurrency drift', () => {
    // Initial state
    const logs: AuditTrail[] = [];

    // Simulating two concurrent requests reading the same initial state
    const expectedParentHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

    // First operation succeeds
    const updatedLogs1 = createAuditLog(logs, 'LOGIN', 'User logged in', expectedParentHash);

    // Second operation should fail because it's using the old expectedParentHash
    assert.throws(() => {
        createAuditLog(updatedLogs1, 'VIEW', 'User viewed case', expectedParentHash);
    }, /Concurrency drift detected/);

    // With correct parent hash, it should succeed
    const newExpectedParentHash = updatedLogs1[0].hash;
    const updatedLogs2 = createAuditLog(updatedLogs1, 'VIEW', 'User viewed case', newExpectedParentHash);
    assert.strictEqual(updatedLogs2.length, 2);
    assert.strictEqual(updatedLogs2[0].hash, newExpectedParentHash);
});
