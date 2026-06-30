import { test } from 'node:test';
import * as assert from 'node:assert';
import { redactPII, createAuditLog } from './audit.ts';
import { AuditTrail } from '../types.ts';

test('redactPII should redact emails', () => {
  const input = "Contact user at john.doe@example.com for more info.";
  const expected = "Contact user at j***@example.com for more info.";
  assert.strictEqual(redactPII(input), expected);
});

test('redactPII should redact SSNs', () => {
  const input = "The suspect SSN is 123-45-6789.";
  const expected = "The suspect SSN is ***-**-6789.";
  assert.strictEqual(redactPII(input), expected);
});

test('redactPII should redact phone numbers', () => {
  const input1 = "Call me at 123-456-7890.";
  const expected1 = "Call me at ***-***-7890.";
  assert.strictEqual(redactPII(input1), expected1);

  const input2 = "Or (555) 123-4567.";
  const expected2 = "Or ***-***-4567.";
  assert.strictEqual(redactPII(input2), expected2);
});

test('redactPII should redact credit cards', () => {
  const input = "Payment card: 1234-5678-9012-3456";
  const expected = "Payment card: ****-****-****-3456";
  assert.strictEqual(redactPII(input), expected);
});

test('createAuditLog should redact action and details before adding log', async () => {
  const emptyLogs: AuditTrail[] = [];
  const action = "Viewed profile for john.doe@example.com";
  const details = "User used SSN 123-45-6789 to verify identity.";

  const updatedLogs = await createAuditLog(emptyLogs, action, details, "Admin");

  assert.strictEqual(updatedLogs.length, 1);
  const log = updatedLogs[0];

  assert.strictEqual(log.action, "Viewed profile for j***@example.com");
  assert.strictEqual(log.details, "User used SSN ***-**-6789 to verify identity.");
  assert.strictEqual(log.author, "Admin");
  assert.ok(log.hash.startsWith("CHK-"));
});
