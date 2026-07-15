import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';

describe('Audit PII Redaction', () => {
  it('should redact emails', () => {
    assert.equal(redactPII('Email is john.doe@example.com'), 'Email is j***@example.com');
  });

  it('should redact SSNs', () => {
    assert.equal(redactPII('SSN: 123-45-6789'), 'SSN: ***-**-6789');
  });

  it('should redact phone numbers', () => {
    assert.equal(redactPII('Call (123) 456-7890'), 'Call ***-***-7890');
    assert.equal(redactPII('Call 123-456-7890'), 'Call ***-***-7890');
  });

  it('should redact credit cards', () => {
    assert.equal(redactPII('Paid with 1234-5678-9012-3456'), 'Paid with ****-****-****-3456');
  });

  it('should apply redaction in createAuditLog', () => {
    const action = "User john.doe@example.com logged in";
    const details = "Phone number 123-456-7890 was updated";
    const logs = createAuditLog([], action, details);

    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, 'User j***@example.com logged in');
    assert.equal(logs[0].details, 'Phone number ***-***-7890 was updated');
  });
});
