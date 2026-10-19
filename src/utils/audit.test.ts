import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog throws without expected parent hash matching', () => {
    const logs: AuditTrail[] = [
        { id: '1', timestamp: '2023-01-01', action: 'test', details: 'test', author: 'tester', hash: 'CHK-ABC' }
    ];

    // Attempting to write with stale parent hash
    assert.throws(
        () => createAuditLog(logs, 'new action', 'details', 'CHK-WRONG-HASH'),
        /Concurrency Drift Detected/
    );
});

test('createAuditLog succeeds when hashes match', () => {
    const logs: AuditTrail[] = [
        { id: '1', timestamp: '2023-01-01', action: 'test', details: 'test', author: 'tester', hash: 'CHK-ABC' }
    ];

    const newLogs = createAuditLog(logs, 'new action', 'details', 'CHK-ABC');
    assert.strictEqual(newLogs.length, 2);
    assert.strictEqual(newLogs[1].action, 'new action');
});

test('createAuditLog handles empty array with genesis hash', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(logs, 'genesis action', 'details', 'CHK-ROOT-GENESIS-CHAIN-STABLE');
    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].action, 'genesis action');
});
