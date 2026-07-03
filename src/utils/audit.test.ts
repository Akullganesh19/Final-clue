import { test } from 'node:test';
import * as assert from 'node:assert';
import { redactPII, createAuditLog } from './audit.ts';

test('redactPII masks email correctly', () => {
  assert.strictEqual(redactPII('User arjun@som.com logged in'), 'User a***@som.com logged in');
});

test('redactPII masks phone correctly', () => {
  assert.strictEqual(redactPII('Phone: 555-123-4567'), 'Phone: ***-***-4567');
  assert.strictEqual(redactPII('Phone: (555) 123-4567'), 'Phone: ***-***-4567');
});

test('redactPII masks SSN correctly', () => {
  assert.strictEqual(redactPII('SSN: 123-45-6789'), 'SSN: ***-**-6789');
});

test('redactPII masks credit card correctly', () => {
  assert.strictEqual(redactPII('Card: 1234-5678-9012-3456'), 'Card: ****-****-****-3456');
});

test('redactPII does not mask unix timestamps', () => {
  assert.strictEqual(redactPII('Timestamp: 1689023456'), 'Timestamp: 1689023456');
});

test('createAuditLog uses redacted details', () => {
  const logs = createAuditLog([], 'LOGIN', 'User arjun@som.com logged in');
  assert.strictEqual(logs[0].details, 'User a***@som.com logged in');
});
