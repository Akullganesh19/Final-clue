import assert from 'assert';
import { generateAuditHash } from './src/utils/audit.js';

// Legacy vulnerable logic for comparison
function legacyHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'CHK-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

const hash1_legacy = legacyHash('PREV', 'LOGIN', 'SUCCESS|ADMIN', 'AUTHOR', 'TIMESTAMP');
const hash2_legacy = legacyHash('PREV', 'LOGIN|SUCCESS', 'ADMIN', 'AUTHOR', 'TIMESTAMP');

// Prove the collision existed in the old logic
assert.strictEqual(hash1_legacy, hash2_legacy, 'Legacy logic should have collided');

// Now check the fixed logic
const hash1_fixed = generateAuditHash('PREV', 'LOGIN', 'SUCCESS|ADMIN', 'AUTHOR', 'TIMESTAMP');
const hash2_fixed = generateAuditHash('PREV', 'LOGIN|SUCCESS', 'ADMIN', 'AUTHOR', 'TIMESTAMP');

// Prove the collision is fixed
assert.notStrictEqual(hash1_fixed, hash2_fixed, 'Fixed logic should not collide');

console.log('Regression test passed!');
