import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog, AuditLedger, generateAuditHash } from './audit.ts';
import { AuditTrail } from '../types.ts';

describe('Audit Log Concurrency Drift Risk', () => {
  it('demonstrates that concurrent log appends create a forked hash chain', async () => {
    // Shared state (simulating a database or state manager)
    let globalLogs: AuditTrail[] = [];

    // Simulate concurrent updates where each operation reads the CURRENT state,
    // does some async work, then writes back.
    const concurrentAppends = Array.from({ length: 5 }).map(async (_, i) => {
      // 1. Read current state
      const currentLogs = [...globalLogs];

      // Simulate small async delay (e.g. database read/network latency)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

      // 2. Compute new state
      const newLogs = createAuditLog(currentLogs, 'ACTION', `Detail ${i}`, 'Tester');

      // 3. Write back
      globalLogs = newLogs;
    });

    await Promise.all(concurrentAppends);

    // Because of the race condition, some logs will overwrite others.
    // We expect LESS than 5 logs to exist, proving the drift.
    // Or if there are multiple logs, they will likely have the SAME previousHash.

    // In our worst case scenario, they all read empty `[]` and all write back an array of length 1.
    assert.strictEqual(globalLogs.length < 5, true, 'Data loss occurred: logs were overwritten');
  });
});

describe('AuditLedger Atomic Sequence', () => {
  it('demonstrates that concurrent log appends do not fork the hash chain or drop logs', async () => {
    const ledger = new AuditLedger();

    // Fire 5 concurrent append operations
    const concurrentAppends = Array.from({ length: 5 }).map(async (_, i) => {
      // Small random delay before appending
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      return ledger.appendLog('ACTION', `Detail ${i}`, 'Tester');
    });

    await Promise.all(concurrentAppends);

    const logs = ledger.getLogs();

    // We expect exactly 5 logs to exist
    assert.strictEqual(logs.length, 5, 'No data loss should occur');

    // Verify hash chain integrity
    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      // By recalculating the hash based on the previous one we prove they are perfectly linked
      const expectedHash = generateAuditHash(prev.hash, curr.action, curr.details, curr.author, curr.timestamp);
      assert.strictEqual(curr.hash, expectedHash, 'Hash chain is unbroken');
    }
  });
});
