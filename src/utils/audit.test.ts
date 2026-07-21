import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactSensitiveData, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('redactSensitiveData', () => {
  it('should redact emails', () => {
    assert.strictEqual(redactSensitiveData('Contact: test@email.com'), 'Contact: [REDACTED EMAIL]');
    assert.strictEqual(redactSensitiveData('Multiple: a@b.com and c@d.org'), 'Multiple: [REDACTED EMAIL] and [REDACTED EMAIL]');
  });

  it('should redact phone numbers', () => {
    assert.strictEqual(redactSensitiveData('Phone: 123-456-7890'), 'Phone: [REDACTED PHONE]');
    assert.strictEqual(redactSensitiveData('Call (123) 456-7890'), 'Call [REDACTED PHONE]');
    assert.strictEqual(redactSensitiveData('International: +1 234 567 8900'), 'International: [REDACTED PHONE]');
    // Should not redact partial numbers
    assert.strictEqual(redactSensitiveData('Number: 12345'), 'Number: 12345');
  });

  it('should redact SSNs', () => {
    assert.strictEqual(redactSensitiveData('My SSN is 123-45-6789.'), 'My SSN is [REDACTED SSN].');
  });

  it('should redact Credit Cards', () => {
    assert.strictEqual(redactSensitiveData('Card: 1234 5678 1234 5678'), 'Card: [REDACTED CC]');
    assert.strictEqual(redactSensitiveData('Card: 1234-5678-1234-5678'), 'Card: [REDACTED CC]');
  });

  it('should leave normal text intact', () => {
    assert.strictEqual(redactSensitiveData('This is a normal log entry.'), 'This is a normal log entry.');
  });
});

describe('createAuditLog', () => {
  it('should redact details before logging and hashing', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(logs, 'ACTION', 'User contact test@email.com', 'Author');

    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].details, 'User contact [REDACTED EMAIL]');
  });
});
