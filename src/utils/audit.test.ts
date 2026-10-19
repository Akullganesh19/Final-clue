import { generateAuditHash, createAuditLog } from './audit';
import assert from 'assert';

let failed = false;

// Regression test for Hash Collision
try {
  const hash1 = generateAuditHash('PREV', 'ACTION', 'DETAILS|SPOOF', 'AUTHOR', '2023-01-01');
  const hash2 = generateAuditHash('PREV', 'ACTION|DETAILS', 'SPOOF', 'AUTHOR', '2023-01-01');
  assert.notStrictEqual(hash1, hash2, 'Hash collision detected due to unsafe delimiter');
  console.log('testHashCollision passed');
} catch (e: any) {
  console.error('testHashCollision failed:', e.message);
  failed = true;
}

// Regression test for ID Collision
try {
  const ids = new Set();
  let logs: any[] = [];
  for (let i = 0; i < 5000; i++) {
    logs = createAuditLog(logs, 'ACTION', 'DETAILS');
    const newLog = logs[logs.length - 1];
    if (ids.has(newLog.id)) {
      throw new Error('ID collision detected');
    }
    ids.add(newLog.id);
  }
  console.log('testIdCollision passed');
} catch (e: any) {
  console.error('testIdCollision failed:', e.message);
  failed = true;
}

if (failed) {
  process.exit(1);
}
