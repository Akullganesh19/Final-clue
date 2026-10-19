import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit.ts';
import { AuditTrail } from '../types.ts';

test('createAuditLog: concurrent modification drift (OCC)', () => {
  const logs: AuditTrail[] = [];
  const expectedHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  const newLogs = createAuditLog(logs, expectedHash, 'ACTION 1', 'details 1');
  assert.strictEqual(newLogs.length, 1);

  // Simulated race condition: caller tries to use the old expected hash
  assert.throws(() => {
    createAuditLog(newLogs, expectedHash, 'ACTION 2', 'details 2');
  }, /OCC check failed/);
});

test('createAuditLog: predictable IDs', () => {
  const logs: AuditTrail[] = [];
  const expectedHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const newLogs = createAuditLog(logs, expectedHash, 'ACTION', 'details');

  assert.ok(!newLogs[0].id.includes('AUDIT-'), 'ID should not be predictable (expected randomUUID)');
  assert.ok(newLogs[0].id.length > 20, 'ID is too short, probably not UUID');
});

test('createAuditLog: PII leakage', () => {
  const logs: AuditTrail[] = [];
  const expectedHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  const detailsWithPII = 'User email is test@example.com and phone is 555-123-4567, SSN 123-45-6789, CC 4111-1111-1111-1111';
  const newLogs = createAuditLog(logs, expectedHash, 'ACTION', detailsWithPII);

  const redacted = newLogs[0].details;
  assert.ok(!redacted.includes('test@example.com'), 'Email was not redacted');
  assert.ok(!redacted.includes('555-123-4567'), 'Phone was not redacted');
  assert.ok(!redacted.includes('123-45-6789'), 'SSN was not redacted');
  assert.ok(!redacted.includes('4111-1111-1111-1111'), 'CC was not redacted');

  // It should not mask Snowflake ID
  const timestampId = '1234567890123'; // no separators
  const newLogs2 = createAuditLog(newLogs, newLogs[0].hash, 'ACTION2', timestampId);
  assert.ok(newLogs2[1].details.includes(timestampId), 'Timestamp or Snowflake ID should not be masked');
});
