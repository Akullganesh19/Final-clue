import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog, generateAuditHash } from './audit';
import { AuditTrail } from '../types';

describe('Audit Ledger - Financial Integrity (Ledger)', () => {
  it('should prevent concurrent read-modify-write drifts via OCC', () => {
    // Initial state
    const initialLogs: AuditTrail[] = [];
    const rootHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

    // Transaction 1 reads state and appends successfully
    const logsAfterT1 = createAuditLog(initialLogs, 'LOGIN', 'User logged in', rootHash);
    const t1Hash = logsAfterT1[0].hash;
    assert.strictEqual(logsAfterT1.length, 1);

    // Transaction 2 tries to append concurrently (read the same initial state, but appends after T1)
    // T2 expects rootHash, but actual state has moved to t1Hash.
    assert.throws(
      () => {
        createAuditLog(logsAfterT1, 'ACTION', 'User performed action', rootHash);
      },
      /OCC Drift Detected/,
      'Should throw OCC error when parent hash diverges'
    );

    // Valid continuation using correct parent hash
    const logsAfterT2 = createAuditLog(logsAfterT1, 'ACTION', 'User performed action', t1Hash);
    assert.strictEqual(logsAfterT2.length, 2);
  });

  it('should avoid delimiter injection attacks during hash generation', () => {
    // With `|` delimiter, "A" | "B|C" and "A|B" | "C" might generate the same hash
    // Using JSON.stringify makes them safe.

    // Case 1: action="A", details="B|C"
    const hash1 = generateAuditHash('PREV', 'A', 'B|C', 'AUTH', 'TIME');

    // Case 2: action="A|B", details="C"
    const hash2 = generateAuditHash('PREV', 'A|B', 'C', 'AUTH', 'TIME');

    // They should have different hashes
    assert.notStrictEqual(hash1, hash2, 'Hashes should differ for different logical values even if string concatenation might be similar with |');
  });
});
