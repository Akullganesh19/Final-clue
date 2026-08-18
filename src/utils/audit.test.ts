import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2, createAuditLog } from './audit.ts';

test('V1 Hash is vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'ACTION', 'A|B', 'C', 'TIME');
  const hash2 = generateAuditHash('PREV', 'ACTION', 'A', 'B|C', 'TIME');
  assert.strictEqual(hash1, hash2);
});

test('V2 Hash prevents delimiter injection', () => {
  const hash1 = generateAuditHashV2('PREV', 'ACTION', 'A|B', 'C', 'TIME');
  const hash2 = generateAuditHashV2('PREV', 'ACTION', 'A', 'B|C', 'TIME');
  assert.notStrictEqual(hash1, hash2);
});

test('createAuditLog uses V2 hash and appends hashVersion', () => {
  const logs = createAuditLog([], 'ACTION', 'DETAILS', 'AUTHOR');
  assert.strictEqual(logs.length, 1);
  assert.ok(logs[0].hash.startsWith('CHK-V2-'));
  assert.strictEqual(logs[0].hashVersion, 2);
});
