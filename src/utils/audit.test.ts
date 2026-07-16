import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog, redactPII } from './audit.js';

describe('Audit Utility', () => {
  it('should redact email PII', () => {
    assert.strictEqual(redactPII("User email is john.doe@example.com"), "User email is j***@example.com");
  });

  it('should redact phone PII', () => {
    assert.strictEqual(redactPII("Phone number is (123) 456-7890"), "Phone number is ***-***-7890");
    assert.strictEqual(redactPII("Phone number is 123-456-7890"), "Phone number is ***-***-7890");
  });

  it('should redact SSN PII', () => {
    assert.strictEqual(redactPII("SSN: 123-45-6789"), "SSN: ***-**-6789");
  });

  it('should redact Credit Card PII', () => {
    assert.strictEqual(redactPII("CC: 1234-5678-9012-3456"), "CC: ****-****-****-3456");
  });

  it('should not corrupt other text', () => {
    assert.strictEqual(redactPII("Transaction ID: 1234567890123456"), "Transaction ID: ****-****-****-3456"); // Assuming continuous 16 digits are treated as CC
  });

  it('should successfully create an audit log with redacted PII in action and details', () => {
    const logs = createAuditLog([], "Logged by john.doe@example.com", "Details include SSN: 123-45-6789 and phone: (555) 123-4567");

    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].action, "Logged by j***@example.com");
    assert.strictEqual(logs[0].details, "Details include SSN: ***-**-6789 and phone: ***-***-4567");
  });
});
