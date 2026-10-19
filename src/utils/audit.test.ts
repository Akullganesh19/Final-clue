import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactPII, generateAuditHash, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('audit utils', () => {
  describe('redactPII', () => {
    it('should redact emails', () => {
      const text = 'User john.doe@example.com logged in.';
      const result = redactPII(text);
      assert.strictEqual(result, 'User [REDACTED EMAIL] logged in.');
    });

    it('should redact SSNs', () => {
      const text = 'The suspect SSN is 123-45-6789.';
      const result = redactPII(text);
      assert.strictEqual(result, 'The suspect SSN is [REDACTED SSN].');
    });

    it('should redact phone numbers', () => {
      const text = 'Call 555-123-4567 or (555) 987-6543 immediately. Also 1234567890.';
      const result = redactPII(text);
      assert.strictEqual(result, 'Call [REDACTED PHONE] or [REDACTED PHONE] immediately. Also [REDACTED PHONE].');
    });

    it('should handle text without PII', () => {
      const text = 'The suspect was seen near the park.';
      const result = redactPII(text);
      assert.strictEqual(result, text);
    });
  });

  describe('generateAuditHash', () => {
    it('should generate consistent hashes for identical inputs', () => {
      const hash1 = generateAuditHash('prev', 'action', 'details', 'author', 'timestamp');
      const hash2 = generateAuditHash('prev', 'action', 'details', 'author', 'timestamp');
      assert.strictEqual(hash1, hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = generateAuditHash('prev', 'action', 'details', 'author', 'timestamp');
      const hash2 = generateAuditHash('prev', 'action2', 'details', 'author', 'timestamp');
      assert.notStrictEqual(hash1, hash2);
    });

    it('should securely handle delimiter edge cases using JSON.stringify', () => {
      const hash1 = generateAuditHash('prev', 'action', 'details|author', 'timestamp', 'time');
      const hash2 = generateAuditHash('prev', 'action|details', 'author', 'timestamp', 'time');
      // With pipe concatenation these could collide, JSON.stringify prevents it
      assert.notStrictEqual(hash1, hash2);
    });
  });

  describe('createAuditLog', () => {
    it('should create an audit log and redact PII in details', () => {
      const logs: AuditTrail[] = [];
      const newLogs = createAuditLog(logs, 'LOGIN', 'User john.doe@example.com logged in via (555) 123-4567.');

      assert.strictEqual(newLogs.length, 1);
      assert.strictEqual(newLogs[0].action, 'LOGIN');
      assert.strictEqual(newLogs[0].details, 'User [REDACTED EMAIL] logged in via [REDACTED PHONE].');
      assert.strictEqual(newLogs[0].author, 'Investigator (Arjun Som)');
      assert.ok(newLogs[0].id.startsWith('AUDIT-'));
      assert.ok(newLogs[0].hash.startsWith('CHK-'));
    });

    it('should chain hashes properly', () => {
      const logs: AuditTrail[] = [];
      const logs1 = createAuditLog(logs, 'ACTION1', 'Details 1');
      const logs2 = createAuditLog(logs1, 'ACTION2', 'Details 2');

      assert.strictEqual(logs2.length, 2);

      // Verify hash generation uses previous hash
      const expectedHash = generateAuditHash(
        logs2[0].hash,
        logs2[1].action,
        logs2[1].details,
        logs2[1].author,
        logs2[1].timestamp
      );
      assert.strictEqual(logs2[1].hash, expectedHash);
    });
  });
});
