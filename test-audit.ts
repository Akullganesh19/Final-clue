import { createAuditLog, generateAuditHash } from './src/utils/audit.js';
import assert from 'node:assert';
import test from 'node:test';

test('Audit log redacts PII but hash uses original data', () => {
  const originalDetails = "Suspect John Doe contacted victim at jdoe2023@gmail.com. Phone: 555-123-4567. SSN: 123-45-6789";
  const logs: any[] = [];

  const newLogs = createAuditLog(logs, "UPDATE_CASE", originalDetails, "Investigator");
  const log = newLogs[0];

  assert.ok(log.details.includes("j***@gmail.com"), "Email should be masked");
  assert.ok(log.details.includes("***-***-4567"), "Phone should be masked");
  assert.ok(log.details.includes("***-**-****"), "SSN should be masked");
  assert.ok(!log.details.includes("jdoe2023@gmail.com"), "Original email should not be present");
  assert.ok(!log.details.includes("555-123-4567"), "Original phone should not be present");
  assert.ok(!log.details.includes("123-45-6789"), "Original SSN should not be present");

  const expectedHash = generateAuditHash("CHK-ROOT-GENESIS-CHAIN-STABLE", "UPDATE_CASE", originalDetails, "Investigator", log.timestamp);
  assert.strictEqual(log.hash, expectedHash, "Hash must use original unredacted details");
});
