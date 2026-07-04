import { test } from 'node:test';
import * as assert from 'node:assert';
import { buildCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

function createMockCase(id: string): Case {
  return {
    id,
    title: `Case ${id}`,
    date: '2023-01-01',
    location: 'City',
    narrative: '...',
    moDescription: '...',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };
}

function createMockLinkage(id: string, caseA: Case, caseB: Case, confidence: number): Linkage {
  return {
    id,
    caseA,
    caseB,
    confidence,
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '...',
    investigatorStatus: 'confirmed'
  };
}

test('buildCaseClusters handles empty states gracefully', () => {
  assert.deepStrictEqual(buildCaseClusters([], []), []);
  assert.deepStrictEqual(buildCaseClusters([createMockCase('1')], []), []);
  assert.deepStrictEqual(buildCaseClusters([], [{ id: 'L1', caseA: createMockCase('1'), caseB: createMockCase('2'), confidence: 90, signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 }, evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending' }]), []);
});

test('buildCaseClusters groups connected cases into a cluster', () => {
  const c1 = createMockCase('1');
  const c2 = createMockCase('2');
  const c3 = createMockCase('3');

  const l1 = createMockLinkage('L1', c1, c2, 80);
  const l2 = createMockLinkage('L2', c2, c3, 90);

  const cases = [c1, c2, c3];
  const linkages = [l1, l2];

  const clusters = buildCaseClusters(cases, linkages, 50);

  assert.strictEqual(clusters.length, 1);
  assert.strictEqual(clusters[0].cases.length, 3);
  assert.strictEqual(clusters[0].linkages.length, 2);
  assert.strictEqual(clusters[0].averageConfidence, 85);
});

test('buildCaseClusters ignores low confidence linkages', () => {
  const c1 = createMockCase('1');
  const c2 = createMockCase('2');

  const l1 = createMockLinkage('L1', c1, c2, 40);

  const cases = [c1, c2];
  const linkages = [l1];

  const clusters = buildCaseClusters(cases, linkages, 50);

  assert.strictEqual(clusters.length, 0);
});

test('buildCaseClusters creates multiple discrete clusters', () => {
  const c1 = createMockCase('1');
  const c2 = createMockCase('2');
  const c3 = createMockCase('3');
  const c4 = createMockCase('4');

  const l1 = createMockLinkage('L1', c1, c2, 80);
  const l2 = createMockLinkage('L2', c3, c4, 90);

  const cases = [c1, c2, c3, c4];
  const linkages = [l1, l2];

  const clusters = buildCaseClusters(cases, linkages, 50);

  assert.strictEqual(clusters.length, 2);

  // Sorted by size then confidence, so cluster with L2 (90) should be first
  assert.strictEqual(clusters[0].averageConfidence, 90);
  assert.strictEqual(clusters[1].averageConfidence, 80);
});
