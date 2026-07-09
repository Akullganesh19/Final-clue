import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('redactPII', () => {
  it('redacts email addresses', () => {
    assert.strictEqual(redactPII('User jules@example.com logged in'), 'User j***@example.com logged in');
  });

  it('redacts SSNs', () => {
    assert.strictEqual(redactPII('SSN: 123-45-6789 is sensitive'), 'SSN: ***-**-6789 is sensitive');
  });

  it('redacts credit cards', () => {
    assert.strictEqual(redactPII('Paid with 1234-5678-9012-3456.'), 'Paid with ****-****-****-3456.');
    assert.strictEqual(redactPII('Paid with 1234 5678 9012 3456.'), 'Paid with ****-****-****-3456.');
  });

  it('redacts phone numbers', () => {
    assert.strictEqual(redactPII('Call me at 123-456-7890.'), 'Call me at ***-***-7890.');
    assert.strictEqual(redactPII('Or (123) 456-7890.'), 'Or (***) ***-7890.');
    assert.strictEqual(redactPII('Or 123.456.7890.'), 'Or ***-***-7890.');
    assert.strictEqual(redactPII('Or 123 456 7890.'), 'Or ***-***-7890.');
  });

  it('handles multiple redactions in one string', () => {
    assert.strictEqual(
      redactPII('User jules@example.com has phone 123-456-7890'),
      'User j***@example.com has phone ***-***-7890'
    );
  });

  it('returns original string if no PII', () => {
    assert.strictEqual(redactPII('Just a normal log message'), 'Just a normal log message');
  });
});

describe('createAuditLog', () => {
  it('redacts action and details before hashing and storing', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(
      logs,
      'Viewed user jules@example.com',
      'SSN 123-45-6789 was viewed'
    );

    const newLog = newLogs[0];
    assert.strictEqual(newLog.action, 'Viewed user j***@example.com');
    assert.strictEqual(newLog.details, 'SSN ***-**-6789 was viewed');

    // Hash should not contain plaintext PII, but it's harder to test the negative,
    // so we just verify the string fields are correctly redacted.
  });
});
