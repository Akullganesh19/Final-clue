import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog, generateAuditHash } from './audit.ts';
import { AuditTrail } from '../types.ts';

test('createAuditLog success with correct OCC parent hash', async () => {
  const emptyLogs: AuditTrail[] = [];
  const expectedRootHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  const newLogs = await createAuditLog(emptyLogs, expectedRootHash, 'Test Action', 'Test Details');

  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(newLogs[0].action, 'Test Action');
  assert.strictEqual(newLogs[0].details, 'Test Details');
});

test('createAuditLog throws OCC error on concurrent/stale write', async () => {
  const emptyLogs: AuditTrail[] = [];
  const expectedRootHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  // First write succeeds
  const logsAfterFirst = await createAuditLog(emptyLogs, expectedRootHash, 'First Action', 'First Details');

  // Second concurrent write trying to use the same expectedRootHash (stale)
  try {
    await createAuditLog(logsAfterFirst, expectedRootHash, 'Concurrent Action', 'Concurrent Details');
    assert.fail('Should have thrown OCC error');
  } catch (err: any) {
    assert.ok(err.message.includes('OCC Error: expected parent hash'), 'Throws correct OCC error message');
  }
});

test('generateAuditHash matches safe serialization', async () => {
  const hash = await generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.ok(hash.startsWith('CHK-'), 'Hash should start with CHK-');
  assert.strictEqual(hash.length, 12, 'Hash should be CHK- + 8 characters long');
});
