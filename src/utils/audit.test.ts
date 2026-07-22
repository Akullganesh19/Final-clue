import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateAuditHashAsync } from './audit';
import * as crypto from 'node:crypto';

// Polyfill Web Crypto API for node:test environment if needed
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto.webcrypto;
}

describe('generateAuditHashAsync', () => {
  test('generates valid CHK- SHA-256 hex string', async () => {
    const hash = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'timestamp');
    assert.ok(hash.startsWith('CHK-'), 'Should start with CHK-');
    assert.strictEqual(hash.length, 4 + 64, 'Should be CHK- plus 64 char hex string');
    const hexPart = hash.substring(4);
    assert.ok(/^[0-9A-F]{64}$/.test(hexPart), 'Should be valid uppercase hex');
  });
});
