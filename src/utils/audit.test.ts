import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.ts';

test('🔴 Delimiter Injection in generateAuditHash', () => {
    // Prove that delimiter injection causes a collision with the current pipe concatenation
    const hash1 = generateAuditHash('prev', 'CREATE|user', 'info', 'admin', 'time');
    const hash2 = generateAuditHash('prev', 'CREATE', 'user|info', 'admin', 'time');

    // We expect them NOT to be equal for a secure hash function,
    // but they ARE equal in the current implementation.
    // The test should fail before the fix and pass after.
    assert.notStrictEqual(hash1, hash2, 'Hashes collided due to delimiter injection');
});

test('🔴 PII not redacted in audit logs', () => {
    const raw = 'User email is test@example.com, SSN is 123-45-6789, Phone is (555) 123-4567, Card is 4111-1111-1111-1111';
    const logs = createAuditLog([], 'TEST', raw, 'System');

    const redacted = logs[0].details;

    assert.strictEqual(redacted.includes('test@example.com'), false, 'Email is exposed');
    assert.strictEqual(redacted.includes('123-45-6789'), false, 'SSN is exposed');
    assert.strictEqual(redacted.includes('(555) 123-4567'), false, 'Phone is exposed');
    assert.strictEqual(redacted.includes('4111-1111-1111-1111'), false, 'Card is exposed');
});
