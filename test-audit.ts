import assert from 'node:assert';
import { test } from 'node:test';
import { generateAuditHash, generateAuditHash_legacy } from './src/utils/audit.ts';

test('Audit hash collision vulnerability', () => {
  // Exploit payload proving collision in the legacy function
  const previousHash = 'PREV-HASH';
  const author = 'AUTHOR';
  const timestamp = '2023-01-01T00:00:00.000Z';

  // Maliciously crafted inputs to shift the delimiter
  const action1 = 'ACTION|EXTRA';
  const details1 = 'DETAILS';

  const action2 = 'ACTION';
  const details2 = 'EXTRA|DETAILS';

  // 1. Prove the legacy function was vulnerable
  const legacyHash1 = generateAuditHash_legacy(previousHash, action1, details1, author, timestamp);
  const legacyHash2 = generateAuditHash_legacy(previousHash, action2, details2, author, timestamp);

  assert.strictEqual(
    legacyHash1,
    legacyHash2,
    'Legacy hash function should exhibit collision vulnerability'
  );

  // 2. Prove the new function is secure and prevents the collision
  const secureHash1 = generateAuditHash(previousHash, action1, details1, author, timestamp);
  const secureHash2 = generateAuditHash(previousHash, action2, details2, author, timestamp);

  assert.notStrictEqual(
    secureHash1,
    secureHash2,
    'Secure hash function must prevent delimiter-shifting collisions'
  );
});
