import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.ts';

test('Delimiter Injection Vulnerability Fixed', async () => {
    // Because we now use JSON.stringify array serialization,
    // these two conceptually different events will produce different hashes
    const previousHash = 'CHK-ROOT';
    const timestamp = '2023-01-01T00:00:00.000Z';
    const author = 'Admin';

    // Event 1: Action = LOGIN, Details = SUCCESS|HACKER
    const hash1 = await generateAuditHash(previousHash, 'LOGIN', 'SUCCESS|HACKER', author, timestamp);

    // Event 2: Action = LOGIN|SUCCESS, Details = HACKER
    const hash2 = await generateAuditHash(previousHash, 'LOGIN|SUCCESS', 'HACKER', author, timestamp);

    assert.notStrictEqual(hash1, hash2, 'VULNERABILITY FIXED: Delimiter injection should no longer produce identical hashes');
});

test('PII Exposure Vulnerability Fixed', async () => {
    // PII redaction ensures sensitive info does not leak into logs
    const logDetails = "User John Doe applied with SSN 123-45-6789 and email john.doe@example.com, using credit card 4111-2222-3333-4444.";
    const logs = await createAuditLog([], 'USER_APPLY', logDetails);

    const createdLog = logs[0];

    assert.strictEqual(createdLog.details.includes('123-45-6789'), false, 'VULNERABILITY FIXED: SSN is masked');
    assert.strictEqual(createdLog.details.includes('john.doe@example.com'), false, 'VULNERABILITY FIXED: Email is masked');
    assert.strictEqual(createdLog.details.includes('4111-2222-3333-4444'), false, 'VULNERABILITY FIXED: Credit Card is masked');

    // Ensure the masked version is present
    assert.strictEqual(createdLog.details.includes('***-**-6789'), true);
    assert.strictEqual(createdLog.details.includes('j***@example.com'), true);
    assert.strictEqual(createdLog.details.includes('****-****-****-4444'), true);
});

test('Audit Log generates a secure hash', async () => {
    const hash = await generateAuditHash('PREV', 'ACT', 'DET', 'AUTH', 'TIME');
    assert.match(hash, /^CHK-[0-9A-F]{8}$/, 'Hash should be prefixed with CHK- and have 8 hex characters');
});
