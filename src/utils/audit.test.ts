import test from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit.js';

test('redactPII masks email correctly', () => {
  assert.strictEqual(redactPII('Contact jdoe123@gmail.com today'), 'Contact j***@gmail.com today');
});

test('redactPII masks SSN correctly', () => {
  assert.strictEqual(redactPII('User SSN is 123-45-6789'), 'User SSN is ***-**-6789');
});

test('redactPII masks credit card correctly', () => {
  assert.strictEqual(redactPII('Paid with 1234-5678-9012-3456'), 'Paid with ****-****-****-3456');
  assert.strictEqual(redactPII('Paid with 1234 5678 9012 3456'), 'Paid with ****-****-****-3456');
});

test('redactPII masks phone number correctly', () => {
  assert.strictEqual(redactPII('Call 123-456-7890 now'), 'Call ***-***-7890 now');
  assert.strictEqual(redactPII('Call (123) 456-7890 now'), 'Call ***-***-7890 now');
});

test('createAuditLog applies redactPII to action, details, author', () => {
  const logs: any[] = [];
  const result = createAuditLog(logs, 'Viewed user 123-45-6789', 'Found email test@example.com', 'admin@domain.com');
  assert.strictEqual(result[0].action, 'Viewed user ***-**-6789');
  assert.strictEqual(result[0].details, 'Found email t***@example.com');
  assert.strictEqual(result[0].author, 'a***@domain.com');
});
