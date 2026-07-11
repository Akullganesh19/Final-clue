import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Audit Utility', () => {
  describe('redactPII', () => {
    it('should redact emails', () => {
      const input = 'Contact john.doe@example.com for more info.';
      const output = redactPII(input);
      assert.strictEqual(output, 'Contact j***@example.com for more info.');
    });

    it('should redact SSNs', () => {
      const input = 'SSN is 123-45-6789.';
      const output = redactPII(input);
      assert.strictEqual(output, 'SSN is XXX-XX-XXXX.');
    });

    it('should redact Credit Cards', () => {
      const input1 = 'Card: 1234-5678-9012-3456';
      const output1 = redactPII(input1);
      assert.strictEqual(output1, 'Card: XXXX-XXXX-XXXX-3456');

      const input2 = 'Card: 1234 5678 9012 3456';
      const output2 = redactPII(input2);
      assert.strictEqual(output2, 'Card: XXXX XXXX XXXX 3456');
    });

    it('should redact phone numbers', () => {
      const input1 = 'Call 123-456-7890.';
      const output1 = redactPII(input1);
      assert.strictEqual(output1, 'Call XXX-XXX-7890.');

      const input2 = 'Call (123) 456-7890.';
      const output2 = redactPII(input2);
      assert.strictEqual(output2, 'Call (XXX) XXX-7890.');
    });

    it('should not redact regular text', () => {
      const input = 'The quick brown fox jumps over the lazy dog 123456789.';
      const output = redactPII(input);
      assert.strictEqual(output, input);
    });
  });

  describe('createAuditLog', () => {
    it('should apply redaction to action and details before creating the log', () => {
      const logs: AuditTrail[] = [];
      const newLogs = createAuditLog(
        logs,
        'Searched for SSN 123-45-6789',
        'Found results for test@example.com',
        'Test User'
      );

      assert.strictEqual(newLogs.length, 1);
      assert.strictEqual(newLogs[0].action, 'Searched for SSN XXX-XX-XXXX');
      assert.strictEqual(newLogs[0].details, 'Found results for t***@example.com');
    });
  });
});
