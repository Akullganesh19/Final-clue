import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog, generateAuditHash } from './audit';
import { AuditTrail } from '../types';

test('createAuditLog handles Optimistic Concurrency Control properly', () => {
  const initialLogs: AuditTrail[] = [];
  const genesisHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  // Successful first append
  const updatedLogs1 = createAuditLog(
    initialLogs,
    'FIRST_ACTION',
    'First detail',
    genesisHash
  );

  assert.strictEqual(updatedLogs1.length, 1);
  const firstLogHash = updatedLogs1[0].hash;

  // Successful second append using the hash of the first log as expectedParentHash
  const updatedLogs2 = createAuditLog(
    updatedLogs1,
    'SECOND_ACTION',
    'Second detail',
    firstLogHash
  );

  assert.strictEqual(updatedLogs2.length, 2);

  // Failed concurrent append: attempting to append to updatedLogs2 using the genesis hash instead of updatedLogs2's latest hash
  assert.throws(
    () => {
      createAuditLog(
        updatedLogs2,
        'CONCURRENT_ACTION',
        'Concurrent detail',
        genesisHash // Outdated parent hash, should trigger OCC failure
      );
    },
    /Optimistic Concurrency Control Failed/
  );
});