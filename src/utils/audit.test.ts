import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.js';

describe('Audit Ledger - Adversarial Tests', () => {
  it('should not allow hash forgery via delimiter injection', () => {
    // Old implementation simply concatenated components with `|`.
    // It would produce the same output for these two inputs:
    // "PREV", "LOGIN|USER", "admin", "author", "2023-01-01"
    // "PREV", "LOGIN", "USER|admin", "author", "2023-01-01"
    // (Both result in "PREV|LOGIN|USER|admin|author|2023-01-01")

    const hash1 = generateAuditHash('PREV', 'LOGIN|USER', 'admin', 'author', '2023-01-01');
    const hash2 = generateAuditHash('PREV', 'LOGIN', 'USER|admin', 'author', '2023-01-01');

    // In a secure system, different logical inputs must produce different hashes
    assert.notStrictEqual(hash1, hash2, 'Hash forgery successful via delimiter injection');
  });
});
