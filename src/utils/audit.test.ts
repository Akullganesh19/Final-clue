import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog, redactPII } from './audit';
import { AuditTrail } from '../types';

test('redactPII redacts emails', () => {
  const text = 'User john.doe@example.com logged in';
  const redacted = redactPII(text);
  assert.strictEqual(redacted, 'User j***@example.com logged in');
});

test('redactPII redacts SSNs', () => {
  const text = 'SSN is 123-45-6789.';
  const redacted = redactPII(text);
  assert.strictEqual(redacted, 'SSN is ***-**-****.');
});

test('redactPII redacts credit cards', () => {
  const text = 'Paid with 1234-5678-9012-3456';
  const redacted = redactPII(text);
  assert.strictEqual(redacted, 'Paid with ****-****-****-****');
});

test('redactPII redacts phone numbers', () => {
  const text = 'Call me at (555) 123-4567 or 555.987.6543';
  const redacted = redactPII(text);
  assert.strictEqual(redacted, 'Call me at ***-***-**** or ***-***-****');
});

test('createAuditLog redacts sensitive details', () => {
  const logs: AuditTrail[] = [];
  const action = 'Viewed user';
  const details = 'User john.doe@example.com viewed profile of 123-45-6789.';

  const newLogs = createAuditLog(logs, action, details);
  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(newLogs[0].details, 'User j***@example.com viewed profile of ***-**-****.');
});
