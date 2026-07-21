import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHashAsync, createAuditLogAsync } from './audit';
import { AuditTrail } from '../types';

describe('Audit Utils Async', () => {
  it('generateAuditHashAsync should produce a consistent CHK- string of 68 characters', async () => {
    const hash1 = await generateAuditHashAsync("ROOT", "LOGIN", "User login", "admin", "2024-01-01T00:00:00.000Z");
    const hash2 = await generateAuditHashAsync("ROOT", "LOGIN", "User login", "admin", "2024-01-01T00:00:00.000Z");

    assert.strictEqual(hash1, hash2, "Identical inputs must produce identical hashes");
    assert.match(hash1, /^CHK-[0-9A-F]{64}$/, "Hash must match CHK- followed by 64 hex uppercase chars");
  });

  it('createAuditLogAsync should create a new log with UUID and proper hash', async () => {
    const emptyLogs: AuditTrail[] = [];
    const logs = await createAuditLogAsync(emptyLogs, "LOGIN", "User login", "admin");

    assert.strictEqual(logs.length, 1);
    const newLog = logs[0];

    assert.strictEqual(newLog.action, "LOGIN");
    assert.strictEqual(newLog.details, "User login");
    assert.strictEqual(newLog.author, "admin");

    // Check UUID v4 structure
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(newLog.id.replace('AUDIT-', ''), uuidRegex, "ID must be a valid UUID v4");

    assert.match(newLog.hash, /^CHK-[0-9A-F]{64}$/, "Hash must match the async hex digest");
  });
});
