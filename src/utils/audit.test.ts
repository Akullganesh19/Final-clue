import { test } from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit.ts'; // or audit.ts depending on execution

test('redactPII redacts sensitive information properly', () => {
  assert.strictEqual(redactPII("Email john.doe@example.com is here"), "Email j***@example.com is here");
  assert.strictEqual(redactPII("SSN 123-45-6789"), "SSN ***-**-6789");
  assert.strictEqual(redactPII("Card 1234-5678-9012-3456"), "Card ****-****-****-3456");
  assert.strictEqual(redactPII("Phone (123) 456-7890"), "Phone (***) ***-7890");
  assert.strictEqual(redactPII("Phone 123-456-7890"), "Phone ***-***-7890");
});

test('createAuditLog uses redactPII', () => {
  const logs = createAuditLog([], 'login', 'User john.doe@example.com logged in with phone (123) 456-7890', 'john');
  assert.strictEqual(logs[0].details, 'User j***@example.com logged in with phone (***) ***-7890');
});
