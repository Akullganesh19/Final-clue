import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.js';

test('Audit Trail - Delimiter Injection', () => {
  const hash1 = generateAuditHash('PREV', 'A|B', 'C', 'AUTH', 'TIME');
  const hash2 = generateAuditHash('PREV', 'A', 'B|C', 'AUTH', 'TIME');

  assert.notStrictEqual(
    hash1,
    hash2,
    'Delimiter injection vulnerability: Hashes match for different distinct inputs!'
  );
});

test('Audit Trail - Concurrency ID Collisions', () => {
  const logs: any[] = [];
  const ids = new Set();

  for (let i = 0; i < 5000; i++) {
    const newLogs = createAuditLog(logs, 'ACTION', 'DETAILS');
    const newId = newLogs[newLogs.length - 1].id;

    assert.ok(!ids.has(newId), `Collision found! Duplicate ID generated: ${newId}`);
    ids.add(newId);
  }
});
