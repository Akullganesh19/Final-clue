import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, createAuditLogAsync, generateAuditHash, generateAuditHashAsync } from './audit';

test('createAuditLog creates unique IDs and falls back correctly', () => {
    const originalCrypto = globalThis.crypto;
    let warningLogged = false;
    const originalWarn = console.warn;
    console.warn = (msg: string) => {
        if (msg.includes('[Genesis Recovery]')) {
            warningLogged = true;
        }
    };

    // Test fallback (no crypto)
    Object.defineProperty(globalThis, 'crypto', { value: undefined, writable: true });
    const log1 = createAuditLog([], 'TEST_ACTION', 'Testing fallback', 'System');
    assert.ok(log1[0].id.startsWith('AUDIT-'));
    assert.strictEqual(warningLogged, true);

    // Test happy path (with crypto)
    warningLogged = false;
    Object.defineProperty(globalThis, 'crypto', {
        value: { randomUUID: () => '123e4567-e89b-12d3-a456-426614174000' },
        writable: true
    });
    const log2 = createAuditLog([], 'TEST_ACTION', 'Testing UUID', 'System');
    assert.strictEqual(log2[0].id, '123e4567-e89b-12d3-a456-426614174000');
    assert.strictEqual(warningLogged, false);

    // Restore
    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, writable: true });
    console.warn = originalWarn;
});

test('createAuditLogAsync creates audit log asynchronously with crypto fallback', async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, writable: true });
    const log = await createAuditLogAsync([], 'ASYNC_ACTION', 'Testing async', 'System');
    assert.ok(log[0].id.startsWith('AUDIT-'));
    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, writable: true });
});
