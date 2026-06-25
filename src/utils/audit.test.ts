import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('Audit ledger enforces Optimistic Concurrency Control (OCC) to prevent drift', () => {
  const initialLogs: AuditTrail[] = [];
  const expectedRootHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  // Action 1 succeeds
  const logs1 = createAuditLog(initialLogs, 'ACTION_1', 'First action', 'Author', expectedRootHash);
  assert.strictEqual(logs1.length, 1);

  // Concurrent Action 2 tries to append to logs1 using an outdated expected hash
  // simulating a read-modify-write drift where it read initialLogs but writes to logs1
  assert.throws(
    () => createAuditLog(logs1, 'ACTION_2', 'Concurrent action', 'Author', expectedRootHash),
    /OCC Error/i
  );
});
