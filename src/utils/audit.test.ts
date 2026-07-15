import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Audit Utility Adversarial Tests', () => {
  it('fails on delimiter injection collision', () => {
    // Delimiter injection - 'PREV|CREATE|USER|john|author|time' vs 'PREV|CREATE|USER|john|author|time'
    const hash1 = generateAuditHash('PREV', 'CREATE|USER', 'john', 'author', 'time');
    const hash2 = generateAuditHash('PREV', 'CREATE', 'USER|john', 'author', 'time');

    // Hash collision should NOT happen now, meaning hashes should be different!
    assert.notStrictEqual(hash1, hash2, 'Hash collision detected via delimiter injection!');
  });

  it('fails to enforce idempotency on retries', () => {
    const logs: AuditTrail[] = [];

    const logsAfter1 = createAuditLog(logs, 'CREATE_USER', 'Details', 'idempotency-key-123', 'Author');
    const logsAfter2 = createAuditLog(logsAfter1, 'CREATE_USER', 'Details', 'idempotency-key-123', 'Author');

    // The length should still be 1 because the second log should have been blocked
    assert.strictEqual(logsAfter2.length, 1, 'Idempotency failure: identical retried action creates duplicate log entry');
  });

  it('fails when idempotency key is missing at runtime', () => {
    const logs: AuditTrail[] = [];
    assert.throws(() => {
      // @ts-ignore
      createAuditLog(logs, 'CREATE_USER', 'Details', '', 'Author');
    }, /idempotencyKey/i, 'Failed to throw on missing idempotency key');
  });

  it('leaks PII unredacted phone numbers', () => {
    const logs: AuditTrail[] = [];
    const logsAfter = createAuditLog(logs, 'CALL_LOG', 'Called user at (555) 123-4567 to verify.', 'idempotency-key-456', 'Author');

    const lastLog = logsAfter[0];
    // Phone number SHOULD BE redacted now
    assert.ok(!lastLog.details.includes('123-4567'), 'PII Leak: Phone number was not redacted in details');

    const logsAfter2 = createAuditLog(logs, 'CALL_555-123-4567', 'Details', 'idempotency-key-789', 'Author');
    assert.ok(!logsAfter2[0].action.includes('123-4567'), 'PII Leak: Phone number was not redacted in action');
  });
});
