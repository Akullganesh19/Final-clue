import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.ts';

describe('createAuditLog', () => {
  it('should redact sensitive information from details and author', () => {
    const logs = [];
    const newLogs = createAuditLog(
      logs,
      'LOGIN',
      'User arjun.som@example.com logged in. Phone: (123) 456-7890.',
      'Investigator (Arjun Som) 123-456-7890'
    );
    const log = newLogs[0];

    assert.ok(log.details.includes('a***@example.com'));
    assert.ok(!log.details.includes('arjun.som@example.com'));
    assert.ok(log.details.includes('***-***-7890'));
    assert.ok(!log.details.includes('(123) 456-7890'));

    assert.ok(log.author.includes('Investigator (Arjun Som) ***-***-7890'));
    assert.ok(!log.author.includes('123-456-7890'));
  });
});
