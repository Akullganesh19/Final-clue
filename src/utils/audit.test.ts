import { test } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit.ts';

test('redactPII masks email', () => {
  assert.strictEqual(redactPII("Contact at john.doe@gmail.com"), "Contact at j***@gmail.com");
});

test('redactPII masks SSN', () => {
  assert.strictEqual(redactPII("My SSN is 123-45-6789."), "My SSN is XXX-XX-6789.");
});

test('redactPII masks credit cards with separators', () => {
  assert.strictEqual(redactPII("Card: 1234-5678-9012-3456"), "Card: XXXX-XXXX-XXXX-3456");
  assert.strictEqual(redactPII("Card: 1234 5678 9012 3456"), "Card: XXXX-XXXX-XXXX-3456");
  // Should not mask continuous numbers (like Snowflake IDs)
  assert.strictEqual(redactPII("ID: 1234567890123456"), "ID: 1234567890123456");
});

test('redactPII masks phone numbers with separators', () => {
  assert.strictEqual(redactPII("Call (555) 123-4567 now"), "Call XXX-XXX-4567 now");
  assert.strictEqual(redactPII("Call 555-123-4567 now"), "Call XXX-XXX-4567 now");
  assert.strictEqual(redactPII("Call 555.123.4567 now"), "Call XXX-XXX-4567 now");
  // Should not mask Unix timestamp
  assert.strictEqual(redactPII("Timestamp: 1684534567"), "Timestamp: 1684534567");
});

test('createAuditLog applies redaction', () => {
  const result = createAuditLog([], 'TEST_ACTION', 'User email is jane.doe@example.com');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].details, 'User email is j***@example.com');
});
