import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  generateAuditHash,
  generateAuditHashAsync,
  createAuditLog,
  createAuditLogAsync
} from './audit';
import { AuditTrail } from '../types';

test('generateAuditHash produces deterministic hash', () => {
  const hash1 = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  const hash2 = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.strictEqual(hash1, hash2);
  assert.ok(hash1.startsWith('CHK-'));
});

test('generateAuditHashAsync produces deterministic hash', async () => {
  const hash1 = await generateAuditHashAsync('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  const hash2 = await generateAuditHashAsync('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.strictEqual(hash1, hash2);
  assert.ok(hash1.startsWith('CHK-'));
});

test('generateAuditHashAsync differs from generateAuditHash', async () => {
  // They use different algorithms, so they should produce different hashes for the same input
  const syncHash = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  const asyncHash = await generateAuditHashAsync('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.notStrictEqual(syncHash, asyncHash);
});

test('createAuditLog adds a log with details', () => {
  const logs: AuditTrail[] = [];
  const action = "TEST_ACTION";
  const details = "Here is an email: admin@test.com";

  const newLogs = createAuditLog(logs, action, details);

  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(newLogs[0].action, action);
  assert.strictEqual(newLogs[0].details, details);
});

test('createAuditLogAsync adds a log with details using async hash', async () => {
  const logs: AuditTrail[] = [];
  const action = "TEST_ACTION_ASYNC";
  const details = "Here is a phone: 123-456-7890";

  const newLogs = await createAuditLogAsync(logs, action, details);

  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(newLogs[0].action, action);
  assert.strictEqual(newLogs[0].details, details);
  assert.ok(newLogs[0].hash.startsWith('CHK-'));
});
