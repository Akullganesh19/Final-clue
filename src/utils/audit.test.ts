import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit';

test('hash should not collide with delimiter injection', () => {
    const h1 = generateAuditHash("H1", "ACTION", "DETAIL|HACK", "AUTHOR", "TIMESTAMP");
    const h2 = generateAuditHash("H1", "ACTION", "DETAIL", "HACK|AUTHOR", "TIMESTAMP");
    assert.notStrictEqual(h1, h2, 'Hashes should not match on delimiter injection');
});

test('id generation should not collide in tight loops', () => {
    const ids = new Set();
    const collisions = [];

    // We conditionally mock it only if it doesn't exist, though Vite browser environments will have it.
    if (!globalThis.crypto) {
        globalThis.crypto = { randomUUID: () => "uuid-" + Math.random().toString(36) } as any;
    }

    for (let i = 0; i < 5000; i++) {
        const logs = createAuditLog([], "ACTION", "DETAILS", "TEST_AUTHOR");
        const id = logs[0].id;
        if (ids.has(id)) {
            collisions.push(id);
        }
        ids.add(id);
    }

    assert.strictEqual(collisions.length, 0, 'Found ID collisions: ' + collisions.length);
});
