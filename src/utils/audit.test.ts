import { test } from 'node:test';
import * as assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('redacts emails', () => {
  assert.strictEqual(redactPII('Contact jsmith@gmail.com for details'), 'Contact j***@gmail.com for details');
});

test('redacts SSNs', () => {
  assert.strictEqual(redactPII('My SSN is 123-45-6789.'), 'My SSN is XXX-XX-XXXX.');
});

test('redacts phone numbers with separators', () => {
  assert.strictEqual(redactPII('Call 555-123-4567'), 'Call [REDACTED PHONE]');
  assert.strictEqual(redactPII('Call (555) 123-4567'), 'Call [REDACTED PHONE]');
  assert.strictEqual(redactPII('Call 555.123.4567'), 'Call [REDACTED PHONE]');
});

test('does not redact timestamps as phone numbers', () => {
  assert.strictEqual(redactPII('ID: 1712345678'), 'ID: 1712345678'); // No separators
});

test('redacts credit cards with separators', () => {
  assert.strictEqual(redactPII('Card: 1234-5678-9012-3456'), 'Card: XXXX-XXXX-XXXX-XXXX');
  assert.strictEqual(redactPII('Card: 1234 5678 9012 3456'), 'Card: XXXX-XXXX-XXXX-XXXX');
});

test('does not redact snowflake IDs as credit cards', () => {
  assert.strictEqual(redactPII('Snowflake: 1234567890123456'), 'Snowflake: 1234567890123456');
});

test('createAuditLog redacts details before saving', () => {
  const logs: AuditTrail[] = [];
  const action = 'VIEW_RECORD';
  const details = 'User contact is jsmith@gmail.com and phone is 555-123-4567';

  const newLogs = createAuditLog(logs, action, details);
  const latestLog = newLogs[newLogs.length - 1];

  assert.strictEqual(latestLog.details, 'User contact is j***@gmail.com and phone is [REDACTED PHONE]');
});
