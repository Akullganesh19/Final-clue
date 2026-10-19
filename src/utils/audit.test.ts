import { test } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit.js';

test('redactPII correctly redacts emails', () => {
  const result = redactPII('Contact jsmith@example.com for info');
  assert.strictEqual(result, 'Contact j***@example.com for info');
});

test('redactPII correctly redacts SSNs', () => {
  const result = redactPII('User SSN is 123-45-6789');
  assert.strictEqual(result, 'User SSN is ***-**-6789');
});

test('redactPII correctly redacts phones', () => {
  const result = redactPII('Call 555-123-4567 for help');
  assert.strictEqual(result, 'Call ***-***-4567 for help');
});

test('createAuditLog applies redaction', () => {
  const logs = createAuditLog([], 'ACTION', 'User email is jsmith@example.com', 'Jane Doe');
  assert.strictEqual(logs[0].details, 'User email is j***@example.com');
  assert.strictEqual(logs[0].author, 'Jane Doe');
});
