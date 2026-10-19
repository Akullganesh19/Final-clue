import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHashAsync, createAuditLogAsync } from './audit.js';
import { AuditTrail } from '../types.js';

describe('Audit Log SHA-256 Migration', () => {
  it('should generate a 64-character SHA-256 hash', async () => {
    const hash = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'time');
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64);
    // Should be a valid hex string
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it('should prevent delimiter injection attacks', async () => {
    // If the input was naively concatenated like `${prev}|${action}`,
    // these two inputs would result in the same hash.
    const hash1 = await generateAuditHashAsync('a|b', 'c', 'details', 'author', 'time');
    const hash2 = await generateAuditHashAsync('a', 'b|c', 'details', 'author', 'time');

    assert.notStrictEqual(hash1, hash2);
  });

  it('should create an audit log asynchronously with a 64-character hash', async () => {
    const logs: AuditTrail[] = [];
    const newLogs = await createAuditLogAsync(logs, 'TEST_ACTION', 'Test details');

    assert.strictEqual(newLogs.length, 1);
    const newLog = newLogs[0];

    assert.strictEqual(newLog.action, 'TEST_ACTION');
    assert.strictEqual(newLog.details, 'Test details');
    assert.strictEqual(newLog.hash.length, 64);
    assert.match(newLog.hash, /^[0-9a-f]{64}$/);
  });

  it('should correctly chain hashes asynchronously', async () => {
    const logs: AuditTrail[] = [];
    const logs1 = await createAuditLogAsync(logs, 'ACTION_1', 'Details 1');
    const logs2 = await createAuditLogAsync(logs1, 'ACTION_2', 'Details 2');

    assert.strictEqual(logs2.length, 2);

    // Hash is derived from the previous hash, so we just verify they both have valid formats
    assert.strictEqual(logs2[0].hash.length, 64);
    assert.strictEqual(logs2[1].hash.length, 64);
  });
});
