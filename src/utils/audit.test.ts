import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, redactPII } from './audit.ts';

test('createAuditLog redacts PII before hashing and storing', () => {
  const logs = [];
  const action = "Viewed user john.doe@example.com profile";
  const details = "User called 555-123-4567 and SSN is 123-45-6789.";

  const newLogs = createAuditLog(logs, action, details, "Investigator");
  const log = newLogs[0];

  assert.ok(!log.action.includes('john.doe@example.com'), 'Email should be redacted in action');
  assert.ok(log.action.includes('j***@example.com'), 'Email should have context');

  assert.ok(!log.details.includes('555-123-4567'), 'Phone should be redacted');
  assert.ok(log.details.includes('[REDACTED PHONE]'), 'Phone redacted tag');

  assert.ok(!log.details.includes('123-45-6789'), 'SSN should be redacted');
  assert.ok(log.details.includes('***-**-****'), 'SSN redacted tag');
});
