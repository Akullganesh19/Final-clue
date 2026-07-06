import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from '../audit';
import { AuditTrail } from '../../types';

describe('Audit Ledger - Concurrency Integrity', () => {
  it('should prove audit chain drifts on concurrent modification (Optimistic Concurrency Control failure)', () => {
    // Shared state
    let logs: AuditTrail[] = [
      { id: '1', timestamp: '2023-01-01', action: 'INIT', details: 'init', author: 'sys', hash: 'CHK-001' }
    ];

    // Simulate two requests coming in at exactly the same time,
    // reading the exact same state before either writes.
    const stateRequestA = [...logs];
    const stateRequestB = [...logs];

    // Request A processes and updates global state
    const newLogsA = createAuditLog(stateRequestA, 'ACTION_A', 'details A', 'UserA');
    logs = newLogsA;

    // Request B processes (using stale state) and updates global state
    const newLogsB = createAuditLog(stateRequestB, 'ACTION_B', 'details B', 'UserB');
    logs = newLogsB;

    // The final state will drop ACTION_A entirely.
    assert.strictEqual(logs.length, 2, 'We expected 3 logs, but due to read-modify-write race, we only have 2');
    assert.strictEqual(logs[1].action, 'ACTION_B');
  });
});
