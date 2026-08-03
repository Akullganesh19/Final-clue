import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2 } from './audit';

test('V1 should have a collision (proves vulnerability existed)', () => {
  const hash1 = generateAuditHash('PREV', 'A|B', 'C', 'AUTH', 'TIME');
  const hash2 = generateAuditHash('PREV', 'A', 'B|C', 'AUTH', 'TIME');
  assert.strictEqual(hash1, hash2, 'V1 hashes should collide');
});

test('V2 should not have a collision', () => {
  const hash1 = generateAuditHashV2('PREV', 'A|B', 'C', 'AUTH', 'TIME');
  const hash2 = generateAuditHashV2('PREV', 'A', 'B|C', 'AUTH', 'TIME');
  assert.notStrictEqual(hash1, hash2, 'V2 hashes should not collide');
});
