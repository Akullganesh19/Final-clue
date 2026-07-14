import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit';

describe('audit', () => {
  it('prevents hash collision from delimiter injection', () => {
    const h1 = generateAuditHash('PREV', 'B|C', 'D', 'author', '1234');
    const h2 = generateAuditHash('PREV', 'B', 'C|D', 'author', '1234');

    assert.notStrictEqual(h1, h2, 'Hash collision detected! The hashing function is vulnerable to delimiter injection.');
  });
});
