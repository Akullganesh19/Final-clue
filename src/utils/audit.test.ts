import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';

describe('audit', () => {
  it('redacts PII correctly', () => {
    const text = 'User john.doe@example.com paid with 1234-5678-9012-3456. SSN is 123-45-6789 and phone is (555) 123-4567.';
    const redacted = redactPII(text);
    assert.match(redacted, /j\*\*\*@example\.com/);
    assert.match(redacted, /\*\*\*\*-\*\*\*\*-\*\*\*\*-3456/);
    assert.match(redacted, /\*\*\*-\*\*-6789/);
    assert.match(redacted, /\*\*\*-\*\*\*-4567/);
  });
});
