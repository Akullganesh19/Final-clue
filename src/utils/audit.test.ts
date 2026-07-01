import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog, generateAuditHash, redactPII } from './audit.js';
import { AuditTrail } from '../types.js';

describe('Audit Ledger - OCC and Financial Integrity', () => {
  test('OCC: Rejects drift when expected parent hash does not match', async () => {
    const existingLogs: AuditTrail[] = [
      { id: '1', timestamp: '2023-01-01', action: 'INIT', details: 'init', author: 'A', hash: 'CHK-12345678' }
    ];

    try {
      await createAuditLog(existingLogs, 'DEBIT', 'Moved 50 credits', 'CHK-WRONGHASH', 'A');
      assert.fail('Should have thrown an OCC error');
    } catch (err: any) {
      assert.match(err.message, /Optimistic Concurrency Control failure/);
    }
  });

  test('OCC: Succeeds when expected parent hash matches', async () => {
    const existingLogs: AuditTrail[] = [
      { id: '1', timestamp: '2023-01-01', action: 'INIT', details: 'init', author: 'A', hash: 'CHK-12345678' }
    ];

    const newLogs = await createAuditLog(existingLogs, 'CREDIT', 'Added 50 credits', 'CHK-12345678', 'A');
    assert.strictEqual(newLogs.length, 2);
    assert.strictEqual(newLogs[1].action, 'CREDIT');
  });

  test('OCC: Root/Genesis check succeeds on empty ledger', async () => {
    const newLogs = await createAuditLog([], 'START', 'Begin', 'CHK-ROOT-GENESIS-CHAIN-STABLE', 'A');
    assert.strictEqual(newLogs.length, 1);
  });
});

describe('Audit Ledger - Security & PII Redaction', () => {
  test('redactPII: Masks emails correctly', () => {
    const details = 'User john.doe@example.com transferred 50 credits to admin@system.org';
    const redacted = redactPII(details);
    assert.strictEqual(redacted, 'User [REDACTED EMAIL] transferred 50 credits to [REDACTED EMAIL]');
  });

  test('redactPII: Masks strictly formatted SSNs', () => {
    const details = 'Client SSN is 123-45-6789 and 999-99-9999.';
    const redacted = redactPII(details);
    assert.strictEqual(redacted, 'Client SSN is [REDACTED SSN] and [REDACTED SSN].');
  });

  test('redactPII: Masks credit cards but ignores timestamp-like strings', () => {
    const details = 'Paid with 1234-5678-9012-3456 or 1111 2222 3333 4444. Event ID 1234567890123456.';
    const redacted = redactPII(details);
    assert.strictEqual(redacted, 'Paid with [REDACTED CC] or [REDACTED CC]. Event ID 1234567890123456.');
  });

  test('redactPII: Masks phone numbers securely', () => {
    const details = 'Contact at +1-555-123-4567 or (555) 987 6543.';
    const redacted = redactPII(details);
    assert.strictEqual(redacted, 'Contact at [REDACTED PHONE] or [REDACTED PHONE].');
  });

  test('generateAuditHash: Returns expected hex format and is deterministic', async () => {
    const hash1 = await generateAuditHash('PREV', 'ACT', 'DET', 'AUTH', 'TIME');
    const hash2 = await generateAuditHash('PREV', 'ACT', 'DET', 'AUTH', 'TIME');
    assert.match(hash1, /^CHK-[0-9A-F]{8}$/);
    assert.strictEqual(hash1, hash2);
  });

  test('createAuditLog: Logs are generated with a UUID format id', async () => {
     const newLogs = await createAuditLog([], 'TEST', 'test', 'CHK-ROOT-GENESIS-CHAIN-STABLE');
     const id = newLogs[0].id;
     // simple sanity regex for UUIDv4
     assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
