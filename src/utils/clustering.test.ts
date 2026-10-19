import { test } from 'node:test';
import * as assert from 'node:assert';
import { detectClusters } from './clustering';
import { Case, Linkage } from '../types';

test('detectClusters', async (t) => {
  // Mock crypto for UUID in tests
  if (!(globalThis as any).crypto) {
    (globalThis as any).crypto = {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7)
    };
  } else if (!(globalThis as any).crypto.randomUUID) {
    (globalThis as any).crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).substring(7);
  }

  const baseCase: Omit<Case, 'id' | 'moCategories'> = {
    title: 'Test Case',
    date: '2023-01-01',
    location: 'Test City',
    narrative: '...',
    moDescription: '...',
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  await t.test('returns empty array when no cases are linked', () => {
    const cases: Case[] = [
      { ...baseCase, id: 'c1', moCategories: ['A', 'B'] },
      { ...baseCase, id: 'c2', moCategories: ['C'] }
    ];
    const clusters = detectClusters(cases, []);
    assert.strictEqual(clusters.length, 0);
  });

  await t.test('groups connected cases and finds common MOs', () => {
    const c1: Case = { ...baseCase, id: 'c1', moCategories: ['Fire', 'Night', 'Solo'] };
    const c2: Case = { ...baseCase, id: 'c2', moCategories: ['Night', 'Solo', 'Mask'] };
    const c3: Case = { ...baseCase, id: 'c3', moCategories: ['Day', 'Group'] };

    const cases = [c1, c2, c3];
    const linkages: Linkage[] = [
      {
        id: 'l1',
        caseA: c1,
        caseB: c2,
        confidence: 80,
        signals: { semantic: 0.8, entity: 0, temporal: 0, mo: 0.9 },
        evidence: [],
        criticFlags: [],
        summary: '',
        investigatorStatus: 'confirmed'
      }
    ];

    const clusters = detectClusters(cases, linkages);
    assert.strictEqual(clusters.length, 1);

    const cluster = clusters[0];
    assert.strictEqual(cluster.cases.length, 2);
    assert.ok(cluster.cases.some(c => c.id === 'c1'));
    assert.ok(cluster.cases.some(c => c.id === 'c2'));

    // Common between ['Fire', 'Night', 'Solo'] and ['Night', 'Solo', 'Mask']
    assert.deepStrictEqual(cluster.commonMoCategories.sort(), ['Night', 'Solo'].sort());
  });

  await t.test('ignores rejected linkages', () => {
    const c1: Case = { ...baseCase, id: 'c1', moCategories: ['A'] };
    const c2: Case = { ...baseCase, id: 'c2', moCategories: ['A'] };

    const cases = [c1, c2];
    const linkages: Linkage[] = [
      {
        id: 'l1',
        caseA: c1,
        caseB: c2,
        confidence: 80,
        signals: { semantic: 0.8, entity: 0, temporal: 0, mo: 0.9 },
        evidence: [],
        criticFlags: [],
        summary: '',
        investigatorStatus: 'rejected' // Should ignore this
      }
    ];

    const clusters = detectClusters(cases, linkages);
    assert.strictEqual(clusters.length, 0); // No clusters since linkage was rejected
  });
});
