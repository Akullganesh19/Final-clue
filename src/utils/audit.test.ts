import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHashAsync, createAuditLogAsync } from './audit';
import { AuditTrail } from '../types';

test('generateAuditHashAsync should return a formatted hash string', async () => {
  const hash = await generateAuditHashAsync('prev', 'CREATE', 'details', 'author', '2023-01-01');
  assert.ok(hash.startsWith('CHK-'));
  assert.strictEqual(hash.length, 12); // 'CHK-' + 8 chars
});

test('createAuditLogAsync should create a new audit log', async () => {
  const initialLogs: AuditTrail[] = [];
  const logs = await createAuditLogAsync(initialLogs, 'LOGIN', 'User logged in', 'Test User');

  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].action, 'LOGIN');
  assert.strictEqual(logs[0].author, 'Test User');
  assert.ok(logs[0].hash.startsWith('CHK-'));

  const secondLogs = await createAuditLogAsync(logs, 'VIEW', 'Viewed case', 'Test User');
  assert.strictEqual(secondLogs.length, 2);
  assert.strictEqual(secondLogs[1].action, 'VIEW');
});
