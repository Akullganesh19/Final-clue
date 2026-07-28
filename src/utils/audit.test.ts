import { createAuditLog } from './audit.ts';
import assert from 'node:assert';
import test from 'node:test';

test('audit log concurrent ID collision', () => {
  const ids = new Set<string>();
  const originalNow = Date.now;
  Date.now = () => 1700000000000;

  let collisionCount = 0;
  for (let i = 0; i < 5000; i++) {
    const res = createAuditLog([], 'ACTION', 'DETAILS');
    if (ids.has(res[0].id)) {
      collisionCount++;
    }
    ids.add(res[0].id);
  }

  Date.now = originalNow;
  assert.strictEqual(collisionCount, 0, 'Expected 0 collisions');
});
