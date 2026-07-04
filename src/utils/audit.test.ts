import { test } from 'node:test';
import * as assert from 'node:assert';
import { redactPII, generateAuditHashAsync, createAuditLogAsync } from './audit';
import { AuditTrail } from '../types';

test('redactPII should mask emails', () => {
  const input = 'Contact user at jsmith@example.com for more info.';
  const output = redactPII(input);
  assert.strictEqual(output, 'Contact user at j***@example.com for more info.');
});

test('redactPII should mask SSNs', () => {
  const input = 'The user SSN is 123-45-6789.';
  const output = redactPII(input);
  assert.strictEqual(output, 'The user SSN is ***-**-****.');
});

test('redactPII should mask credit cards', () => {
  const input = 'Payment with card 1234-5678-9012-3456 approved.';
  const output = redactPII(input);
  assert.strictEqual(output, 'Payment with card ****-****-****-3456 approved.');
});

test('redactPII should mask phone numbers', () => {
  const input = 'Call me at (555) 123-4567 or 555-987-6543.';
  const output = redactPII(input);
  assert.strictEqual(output, 'Call me at [REDACTED PHONE] or [REDACTED PHONE].');
});

test('generateAuditHashAsync should generate a SHA-256 hash', async () => {
  const hash = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'timestamp');
  assert.ok(hash.startsWith('SHA256-'));
  assert.strictEqual(hash.length, 7 + 16); // 'SHA256-' + 16 hex chars
});

test('createAuditLogAsync should create an audit log with redacted details and a SHA-256 hash', async () => {
  const logs: AuditTrail[] = [];
  const action = 'TEST_ACTION';
  const details = 'User email is test@example.com';
  const author = 'Test Author';

  const newLogs = await createAuditLogAsync(logs, action, details, author);
  assert.strictEqual(newLogs.length, 1);
  const newLog = newLogs[0];

  assert.strictEqual(newLog.action, action);
  assert.strictEqual(newLog.details, 'User email is t***@example.com');
  assert.strictEqual(newLog.author, author);
  assert.ok(newLog.hash.startsWith('SHA256-'));
});
