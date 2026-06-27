import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit';

test('Sentinel: generateAuditHash prevents separator injection collisions', () => {
  // Simulating an attacker inserting '|' to make logical values combine identically
  const hash1 = generateAuditHash('PREV', 'A|B', 'C', 'auth', 'time');
  const hash2 = generateAuditHash('PREV', 'A', 'B|C', 'auth', 'time');

  assert.notStrictEqual(
    hash1,
    hash2,
    'Exploitable collision found! Hashes should be different due to JSON.stringify serialization.'
  );
});

test('Sentinel: createAuditLog handles null or undefined logs gracefully', () => {
  // Test with null
  const logsFromNull = createAuditLog(null as any, 'action', 'details');
  assert.strictEqual(logsFromNull.length, 1);
  assert.strictEqual(logsFromNull[0].action, 'action');

  // Test with undefined
  const logsFromUndefined = createAuditLog(undefined as any, 'action', 'details');
  assert.strictEqual(logsFromUndefined.length, 1);
  assert.strictEqual(logsFromUndefined[0].action, 'action');
});
