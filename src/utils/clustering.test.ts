import { test } from 'node:test';
import * as assert from 'node:assert';
import { findCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

function createMockCase(id: string): Case {
  return {
    id,
    title: `Case ${id}`,
    date: '2020-01-01',
    location: 'City',
    narrative: 'Narrative',
    moDescription: 'MO',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'cold'
  };
}

function createMockLinkage(id: string, caseA: Case, caseB: Case, status: Linkage['investigatorStatus'] = 'confirmed'): Linkage {
  return {
    id,
    caseA,
    caseB,
    confidence: 90,
    signals: { semantic: 80, entity: 80, temporal: 80, mo: 80 },
    evidence: [],
    criticFlags: [],
    summary: 'Linkage',
    investigatorStatus: status
  };
}

test('findCaseClusters groups connected cases', () => {
  const case1 = createMockCase('1');
  const case2 = createMockCase('2');
  const case3 = createMockCase('3');
  const case4 = createMockCase('4'); // Unconnected

  const linkages = [
    createMockLinkage('L1', case1, case2),
    createMockLinkage('L2', case2, case3)
  ];

  const clusters = findCaseClusters([case1, case2, case3, case4], linkages);

  assert.strictEqual(clusters.length, 1);
  assert.strictEqual(clusters[0].cases.length, 3);
  const clusterCaseIds = new Set(clusters[0].cases.map(c => c.id));
  assert.ok(clusterCaseIds.has('1'));
  assert.ok(clusterCaseIds.has('2'));
  assert.ok(clusterCaseIds.has('3'));
  assert.ok(!clusterCaseIds.has('4'));
});

test('findCaseClusters ignores rejected linkages', () => {
  const case1 = createMockCase('1');
  const case2 = createMockCase('2');

  const linkages = [
    createMockLinkage('L1', case1, case2, 'rejected')
  ];

  const clusters = findCaseClusters([case1, case2], linkages);
  assert.strictEqual(clusters.length, 0); // No cluster formed because linkage is rejected
});
