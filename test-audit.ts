import { createAuditLog, generateAuditHash } from './src/utils/audit.ts';
import assert from 'assert';

const logs: any[] = [];
const action = 'ACCESS';
const details = 'User john.doe@email.com accessed the case.';
const author = 'Admin';
const timestamp = new Date().toISOString();

// Hash must use unredacted details
const expectedHash = generateAuditHash('CHK-ROOT-GENESIS-CHAIN-STABLE', action, details, author, timestamp);

const newLogs = createAuditLog(logs, action, details, author);
const log = newLogs[0];

assert.strictEqual(log.details, 'User j***@email.com accessed the case.');
console.log("Test passed: Log details were redacted to", log.details);
