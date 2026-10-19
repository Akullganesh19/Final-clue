import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2, createAuditLog, createAuditLogV2 } from './audit.js';
import type { AuditTrail } from '../types.js';

describe('AuditTrail', () => {
  it('V1 should remain backward compatible', () => {
    const v1Hash = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
    assert.ok(v1Hash.startsWith('CHK-'));
  });

  it('V2 should generate a SHA-256 hash asynchronously', async () => {
    const v2Hash = await generateAuditHashV2('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
    assert.ok(v2Hash.startsWith('CHK-V2-'));
    // A SHA-256 hex string is 64 characters long, plus the "CHK-V2-" prefix (7 chars) = 71 characters total.
    assert.strictEqual(v2Hash.length, 71);
  });

  it('createAuditLog should synchronously add a log with V1 hash', () => {
     const logs: AuditTrail[] = [];
     const newLogs = createAuditLog(logs, 'ACTION', 'DETAILS', 'AUTHOR');
     assert.strictEqual(newLogs.length, 1);
     assert.ok(newLogs[0].hash.startsWith('CHK-'));
     assert.strictEqual(newLogs[0].hashVersion, undefined);
  });

  it('createAuditLogV2 should asynchronously add a log with V2 hash and versioning', async () => {
     const logs: AuditTrail[] = [];
     const newLogs = await createAuditLogV2(logs, 'ACTION', 'DETAILS', 'AUTHOR');
     assert.strictEqual(newLogs.length, 1);
     assert.ok(newLogs[0].hash.startsWith('CHK-V2-'));
     assert.strictEqual(newLogs[0].hashVersion, 2);
  });
});