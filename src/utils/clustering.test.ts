import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

describe('generateCaseClusters', () => {
  const createMockCase = (id: string): Case => ({
    id,
    title: `Case ${id}`,
    date: '2023-01-01',
    location: 'City',
    narrative: '...',
    moDescription: '...',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  });

  const createMockLinkage = (id: string, caseA: Case, caseB: Case): Linkage => ({
    id,
    caseA,
    caseB,
    confidence: 90,
    signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [],
    criticFlags: [],
    summary: '...',
    investigatorStatus: 'pending'
  });

  test('should return empty array for empty linkages', () => {
    const cases = [createMockCase('1')];
    const clusters = generateCaseClusters(cases, []);
    assert.strictEqual(clusters.length, 0);
  });

  test('should group cases into a single cluster if they are all connected', () => {
    const c1 = createMockCase('1');
    const c2 = createMockCase('2');
    const c3 = createMockCase('3');

    const cases = [c1, c2, c3];
    const linkages = [
      createMockLinkage('L1', c1, c2),
      createMockLinkage('L2', c2, c3),
    ];

    const clusters = generateCaseClusters(cases, linkages);
    assert.strictEqual(clusters.length, 1);
    assert.strictEqual(clusters[0].cases.length, 3);
    assert.strictEqual(clusters[0].linkages.length, 2);
  });

  test('should separate disconnected components into different clusters', () => {
    const c1 = createMockCase('1');
    const c2 = createMockCase('2');
    const c3 = createMockCase('3');
    const c4 = createMockCase('4');

    const cases = [c1, c2, c3, c4];
    const linkages = [
      createMockLinkage('L1', c1, c2),
      createMockLinkage('L2', c3, c4),
    ];

    const clusters = generateCaseClusters(cases, linkages);
    assert.strictEqual(clusters.length, 2);
    assert.strictEqual(clusters[0].cases.length, 2);
    assert.strictEqual(clusters[1].cases.length, 2);
  });

  test('should handle missing cases in cases array but present in linkages', () => {
    const c1 = createMockCase('1');
    const c2 = createMockCase('2');

    const linkages = [
      createMockLinkage('L1', c1, c2),
    ];

    const clusters = generateCaseClusters([], linkages);
    assert.strictEqual(clusters.length, 1);
    assert.strictEqual(clusters[0].cases.length, 2);
    assert.strictEqual(clusters[0].cases[0].id, '1');
    assert.strictEqual(clusters[0].cases[1].id, '2');
  });
});
