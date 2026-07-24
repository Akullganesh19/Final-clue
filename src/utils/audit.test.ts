import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.ts';

test('Sentinel Regression: generateAuditHash should not be vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'LOGIN', 'SUCCESS|admin', 'system', '2023-01-01');
  const hash2 = generateAuditHash('PREV', 'LOGIN|SUCCESS', 'admin', 'system', '2023-01-01');
  assert.notStrictEqual(hash1, hash2, 'Hashes should not match for different fields that overlap with delimiters');
});

test('Sentinel Regression: createAuditLog should not generate colliding IDs under high concurrency', () => {
  const logs: any[] = [];
  const numCalls = 5000;
  const ids = new Set();

  // To avoid Node.js crypto randomUUID not being present in some older environments,
  // globalThis.crypto should exist in modern Node (v19+) and browsers.
  for (let i = 0; i < numCalls; i++) {
    const result = createAuditLog(logs, 'ACTION', 'DETAILS');
    const id = result[result.length - 1].id;
    ids.add(id);
  }

  assert.strictEqual(ids.size, numCalls, 'All generated IDs must be unique');
});
