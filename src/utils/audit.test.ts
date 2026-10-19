import { generateAuditHash, generateAuditHashV2, createAuditLog } from './audit';
import assert from 'assert';

// Test legacy hashing is vulnerable to delimiter injection
const hash1 = generateAuditHash('prev', 'CREATE', 'user|admin', 'bob', '2023');
const hash2 = generateAuditHash('prev', 'CREATE|user', 'admin', 'bob', '2023');
assert.strictEqual(hash1, hash2);

// Test V2 hashing is robust against delimiter injection
const hashV2_1 = generateAuditHashV2('prev', 'CREATE', 'user|admin', 'bob', '2023');
const hashV2_2 = generateAuditHashV2('prev', 'CREATE|user', 'admin', 'bob', '2023');
assert.notStrictEqual(hashV2_1, hashV2_2);

// Test createAuditLog uses V2 and versioning
const logs = createAuditLog([], 'CREATE', 'test', 'author');
assert.strictEqual(logs.length, 1);
assert.strictEqual(logs[0].hashVersion, 2);
console.log('Tests passed');
