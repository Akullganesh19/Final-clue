import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog, verifyAuditTrail } from './audit.js';
import { AuditTrail } from '../types.js';

describe('Audit Trail Integrity and Concurrency', () => {
  it('should successfully append and verify a valid chain', () => {
    let logs: AuditTrail[] = [];
    logs = createAuditLog(logs, 'INIT', 'System start');
    logs = createAuditLog(logs, 'OP_1', 'Operation 1');

    assert.strictEqual(logs.length, 2);
    assert.strictEqual(verifyAuditTrail(logs), true);
  });

  it('should detect tampered chains via verifyAuditTrail', () => {
    let logs: AuditTrail[] = [];
    logs = createAuditLog(logs, 'INIT', 'System start');
    logs = createAuditLog(logs, 'OP_1', 'Operation 1');

    // Tamper with the chain
    logs[0].details = 'Tampered start';

    assert.strictEqual(verifyAuditTrail(logs), false);
  });

  it('should prevent concurrent read-modify-write drifts using expectedParentHash', async () => {
    let backendDb: AuditTrail[] = [];

    // Simulate async operation that reads state, delays, and writes back
    async function asyncAppendLog(action: string, details: string) {
      // 1. Read current state
      const currentLogs = [...backendDb];

      // Determine what we expect the parent to be
      const lastLog = currentLogs[currentLogs.length - 1];
      const expectedParentHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

      // 2. Yield to event loop (simulate DB latency)
      await new Promise(resolve => setTimeout(resolve, 10));

      // Simulating what happens in a typical concurrent environment:
      // By the time this continues, the backendDb might have been modified by the OTHER Promise.
      // So we must check the CURRENT last item in the actual backendDb against what we EXPECTED.
      // In a real database, this is typically done via Optimistic Concurrency Control (OCC)
      // e.g. `UPDATE table SET ... WHERE last_hash = expectedParentHash`

      // Here we simulate the OCC check before applying the change
      const currentBackendLastLog = backendDb[backendDb.length - 1];
      const currentBackendParentHash = currentBackendLastLog ? currentBackendLastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

      // Use our new check in createAuditLog by passing the expectedParentHash,
      // but applying it to the actual current backend state (not the stale one we read earlier).
      // If we used the stale one, `createAuditLog` would succeed but return a fork.
      // We pass the expectedParentHash to ensure we are appending to what we thought we were.
      const newLogs = createAuditLog(backendDb, action, details, "System", expectedParentHash);

      // 4. Write back
      backendDb = newLogs;
    }

    // We start both async appends at the exact same time
    const p1 = asyncAppendLog('ACTION_1', 'detail 1');
    const p2 = asyncAppendLog('ACTION_2', 'detail 2');

    // One will succeed, the other will fail because it's reading an outdated parent hash
    let errors = 0;
    try {
      await Promise.all([p1, p2]);
    } catch (e: any) {
      assert.match(e.message, /Concurrency Exception: Audit trail drifted/);
      errors++;
    }

    assert.strictEqual(errors, 1);
    assert.strictEqual(backendDb.length, 1);
  });
});
