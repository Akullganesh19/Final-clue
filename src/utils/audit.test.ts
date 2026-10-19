import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHashAsync, createAuditLogAsync } from './audit';
import { AuditTrail } from '../types';

test('generateAuditHashAsync produces deterministic hash', async () => {
  const hash1 = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'time');
  const hash2 = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'time');
  assert.strictEqual(hash1, hash2);
  assert.match(hash1, /^CHK-[0-9A-F]{8}$/);
});

test('createAuditLogAsync creates a new log entry', async () => {
  const logs: AuditTrail[] = [];
  const newLogs = await createAuditLogAsync(logs, 'LOGIN', 'User logged in');
  assert.strictEqual(newLogs.length, 1);
  assert.match(newLogs[0].id, /^AUDIT-\d+-[a-f0-9-]+$/);
  assert.strictEqual(newLogs[0].action, 'LOGIN');
});
