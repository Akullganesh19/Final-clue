import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { redactPII, generateAuditHash, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('audit utils', () => {
  it('redacts emails correctly', () => {
    assert.strictEqual(redactPII('test jsmith@gmail.com here'), 'test j***@gmail.com here');
  });

  it('redacts SSNs correctly', () => {
    assert.strictEqual(redactPII('ssn is 123-45-6789 ok'), 'ssn is XXX-XX-XXXX ok');
  });

  it('redacts credit cards correctly', () => {
    assert.strictEqual(redactPII('card 1234-5678-9012-3456 used'), 'card XXXX-XXXX-XXXX-3456 used');
  });

  it('redacts phone numbers correctly', () => {
    assert.strictEqual(redactPII('phone +1-555-123-4567 called'), 'phone [REDACTED PHONE] called');
  });

  it('createAuditLog applies redaction', () => {
    const logs: AuditTrail[] = [];
    const newLogs = createAuditLog(logs, 'Login jdoe@example.com', 'SSN 987-65-4321', '555-123-4567');
    assert.strictEqual(newLogs.length, 1);
    const log = newLogs[0];
    assert.strictEqual(log.action, 'Login j***@example.com');
    assert.strictEqual(log.details, 'SSN XXX-XX-XXXX');
    assert.strictEqual(log.author, '[REDACTED PHONE]');
  });
});
