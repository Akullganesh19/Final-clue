import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';
import { AuditTrail } from '../types.js';

test('Audit log IDs must be unique under high concurrency', () => {
  const logs: AuditTrail[] = [];
  const generatedIds = new Set<string>();

  const realDateNow = Date.now;
  const fixedTime = 1600000000000;
  Date.now = () => fixedTime;

  let collisions = 0;
  for (let i = 0; i < 2000; i++) {
    const newLogs = createAuditLog(logs, 'ACTION', 'DETAILS');
    const newLog = newLogs[newLogs.length - 1];

    if (generatedIds.has(newLog.id)) {
      collisions++;
    }
    generatedIds.add(newLog.id);
  }

  Date.now = realDateNow;

  assert.strictEqual(collisions, 0, `Expected 0 collisions, found ${collisions}. Concurrency bug in ID generation.`);
});
