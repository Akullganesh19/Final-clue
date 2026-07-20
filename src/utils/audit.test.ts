import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashAsync, createAuditLog } from './audit';

describe('Audit Utility', () => {
  it('generateAuditHashAsync should return stable async hashes using Web Crypto API', async () => {
    const hash1 = await generateAuditHashAsync('CHK-ROOT', 'ACTION', 'DETAIL', 'AUTHOR', '2023-01-01T00:00:00.000Z');
    const hash2 = await generateAuditHashAsync('CHK-ROOT', 'ACTION', 'DETAIL', 'AUTHOR', '2023-01-01T00:00:00.000Z');
    const hashDifferent = await generateAuditHashAsync('CHK-ROOT', 'ACTION2', 'DETAIL', 'AUTHOR', '2023-01-01T00:00:00.000Z');

    assert.strictEqual(hash1, hash2, 'Identical inputs should produce identical hashes');
    assert.notStrictEqual(hash1, hashDifferent, 'Different inputs should produce different hashes');
    assert.match(hash1, /^CHK-[0-9A-F]{8}$/, 'Hash should start with CHK- followed by 8 hex characters');
  });

  it('createAuditLog should work synchronously and generate legacy style hash', () => {
    const logs: any[] = [];
    const newLogs = createAuditLog(logs, 'LOGIN', 'User logged in', 'Admin');

    assert.strictEqual(newLogs.length, 1, 'Should return array with 1 log');
    assert.strictEqual(newLogs[0].action, 'LOGIN', 'Action should match');
    assert.strictEqual(newLogs[0].details, 'User logged in', 'Details should match');
    assert.strictEqual(newLogs[0].author, 'Admin', 'Author should match');
    assert.match(newLogs[0].hash, /^CHK-[0-9A-F]{1,8}$/, 'Synchronous hash should maintain legacy format');
  });
});
