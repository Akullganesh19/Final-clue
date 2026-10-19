import { test } from 'node:test';
import * as assert from 'node:assert';
import { findCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

test('findCaseClusters handles empty inputs', () => {
  assert.deepStrictEqual(findCaseClusters([], []), []);
});

test('findCaseClusters groups pairwise linkages into macro patterns', () => {
  const caseA: Case = {
    id: 'caseA', title: 'A', date: '2023-01-01', location: 'City A',
    narrative: 'A', moDescription: 'A', moCategories: ['Arson', 'Night'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const caseB: Case = {
    id: 'caseB', title: 'B', date: '2023-02-01', location: 'City B',
    narrative: 'B', moDescription: 'B', moCategories: ['Arson', 'Night'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const caseC: Case = {
    id: 'caseC', title: 'C', date: '2023-03-01', location: 'City C',
    narrative: 'C', moDescription: 'C', moCategories: ['Arson'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const caseD: Case = {
    id: 'caseD', title: 'D', date: '2023-04-01', location: 'City D',
    narrative: 'D', moDescription: 'D', moCategories: ['Burglary'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const cases = [caseA, caseB, caseC, caseD];

  const linkage1: Linkage = {
    id: 'link1', caseA, caseB, confidence: 90,
    signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending'
  };

  const linkage2: Linkage = {
    id: 'link2', caseA: caseB, caseB: caseC, confidence: 80,
    signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending'
  };

  const linkages = [linkage1, linkage2];

  const clusters = findCaseClusters(cases, linkages);

  assert.strictEqual(clusters.length, 1);
  const cluster = clusters[0];

  assert.strictEqual(cluster.cases.length, 3);
  assert.strictEqual(cluster.cases.some(c => c.id === 'caseA'), true);
  assert.strictEqual(cluster.cases.some(c => c.id === 'caseB'), true);
  assert.strictEqual(cluster.cases.some(c => c.id === 'caseC'), true);
  assert.strictEqual(cluster.cases.some(c => c.id === 'caseD'), false);

  assert.strictEqual(cluster.linkages.length, 2);
  assert.strictEqual(cluster.overallConfidence, 85);

  assert.deepStrictEqual(cluster.commonMoCategories, ['Arson']);
  assert.strictEqual(cluster.name, 'Pattern: Arson Serial');
});
