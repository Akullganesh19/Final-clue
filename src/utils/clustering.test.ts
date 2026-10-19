import { test, mock } from 'node:test';
import assert from 'node:assert';
import { findCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

test('findCaseClusters handles empty cases and linkages arrays', () => {
  const result1 = findCaseClusters([], [], 0);
  assert.deepStrictEqual(result1, []);

  const result2 = findCaseClusters([{} as Case], [], 0);
  assert.deepStrictEqual(result2, []);
});

test('findCaseClusters ignores isolated cases', () => {
  const cases: Case[] = [
    { id: 'c1', title: 'C1', date: '2020', location: 'L1', narrative: 'N1', moDescription: 'M1', moCategories: ['A'], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' },
    { id: 'c2', title: 'C2', date: '2020', location: 'L2', narrative: 'N2', moDescription: 'M2', moCategories: ['B'], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' }
  ];

  const linkages: Linkage[] = [];

  const clusters = findCaseClusters(cases, linkages, 0);
  assert.strictEqual(clusters.length, 0);
});

test('findCaseClusters correctly groups linked cases and calculates average confidence', () => {
  mock.timers.enable({ apis: ['Date'] });
  globalThis.Date.now = () => 1600000000000;

  const cases: Case[] = [
    { id: 'c1', title: 'C1', date: '2020', location: 'L1', narrative: 'N1', moDescription: 'M1', moCategories: ['A', 'B'], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' },
    { id: 'c2', title: 'C2', date: '2020', location: 'L2', narrative: 'N2', moDescription: 'M2', moCategories: ['B', 'C'], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' },
    { id: 'c3', title: 'C3', date: '2020', location: 'L3', narrative: 'N3', moDescription: 'M3', moCategories: ['B'], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' }
  ];

  const linkages: Linkage[] = [
    {
      id: 'l1',
      caseA: cases[0],
      caseB: cases[1],
      confidence: 80,
      signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
      evidence: [],
      criticFlags: [],
      summary: '',
      investigatorStatus: 'pending'
    },
    {
      id: 'l2',
      caseA: cases[1],
      caseB: cases[2],
      confidence: 90,
      signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
      evidence: [],
      criticFlags: [],
      summary: '',
      investigatorStatus: 'pending'
    }
  ];

  const clusters = findCaseClusters(cases, linkages, 0);
  assert.strictEqual(clusters.length, 1);

  const cluster = clusters[0];
  assert.strictEqual(cluster.cases.length, 3);
  assert.strictEqual(cluster.linkages.length, 2);

  // Confidences are 80 and 90, so average should be 85
  assert.strictEqual(cluster.averageConfidence, 85);

  // 'B' is in all 3 cases, so it's > 50%.
  // 'A' is in 1 of 3 (33%), 'C' is in 1 of 3 (33%)
  assert.deepStrictEqual(cluster.commonMoCategories, ['B']);

  // Just to make sure ID format looks generally ok, though random floor might differ
  assert.ok(cluster.id.startsWith('CLUSTER-1600000000000-'));

  mock.timers.reset();
});

test('findCaseClusters respects minConfidence parameter', () => {
  const cases: Case[] = [
    { id: 'c1', title: 'C1', date: '2020', location: 'L1', narrative: 'N1', moDescription: 'M1', moCategories: [], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' },
    { id: 'c2', title: 'C2', date: '2020', location: 'L2', narrative: 'N2', moDescription: 'M2', moCategories: [], entities: {person: [], vehicle: [], location: [], weapon: []}, status: 'open' }
  ];

  const linkages: Linkage[] = [
    {
      id: 'l1',
      caseA: cases[0],
      caseB: cases[1],
      confidence: 50,
      signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
      evidence: [],
      criticFlags: [],
      summary: '',
      investigatorStatus: 'pending'
    }
  ];

  // minConfidence is 60, linkage confidence is 50, so should be 0 clusters
  const clusters = findCaseClusters(cases, linkages, 60);
  assert.strictEqual(clusters.length, 0);

  // minConfidence is 50, linkage confidence is 50, so should be 1 cluster
  const clustersValid = findCaseClusters(cases, linkages, 50);
  assert.strictEqual(clustersValid.length, 1);
});
