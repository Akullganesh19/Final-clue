import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

test('generateCaseClusters groups connected linkages', () => {
  const case1: Case = {
    id: 'C1',
    title: 'Case 1',
    date: '2020-01-01',
    location: 'City A',
    narrative: '...',
    moDescription: '...',
    moCategories: ['Nighttime', 'Forced Entry'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const case2: Case = {
    id: 'C2',
    title: 'Case 2',
    date: '2020-02-01',
    location: 'City A',
    narrative: '...',
    moDescription: '...',
    moCategories: ['Nighttime', 'Knife'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const case3: Case = {
    id: 'C3',
    title: 'Case 3',
    date: '2020-03-01',
    location: 'City B',
    narrative: '...',
    moDescription: '...',
    moCategories: ['Nighttime', 'Forced Entry'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const case4: Case = {
    id: 'C4',
    title: 'Case 4', // Isolated
    date: '2020-04-01',
    location: 'City C',
    narrative: '...',
    moDescription: '...',
    moCategories: ['Daytime'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const cases = [case1, case2, case3, case4];

  const linkage1: Linkage = {
    id: 'L1',
    caseA: case1,
    caseB: case2,
    confidence: 80,
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '...',
    investigatorStatus: 'pending'
  };

  const linkage2: Linkage = {
    id: 'L2',
    caseA: case2,
    caseB: case3,
    confidence: 90,
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '...',
    investigatorStatus: 'confirmed'
  };

  const clusters = generateCaseClusters(cases, [linkage1, linkage2]);

  assert.strictEqual(clusters.length, 1);
  const cluster = clusters[0];

  assert.strictEqual(cluster.cases.length, 3);
  assert.ok(cluster.cases.find(c => c.id === 'C1'));
  assert.ok(cluster.cases.find(c => c.id === 'C2'));
  assert.ok(cluster.cases.find(c => c.id === 'C3'));

  assert.strictEqual(cluster.confidenceScore, 85); // (80 + 90) / 2
  assert.deepStrictEqual(cluster.commonLocations, ['City A']);
  assert.deepStrictEqual(cluster.coreMoCategories.sort(), ['Forced Entry', 'Nighttime'].sort());
});

test('generateCaseClusters respects confidence thresholds and rejected status', () => {
  const case1: Case = {
    id: 'C1',
    title: 'Case 1',
    date: '2020-01-01',
    location: 'City A',
    narrative: '...',
    moDescription: '...',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const case2: Case = {
    id: 'C2',
    title: 'Case 2',
    date: '2020-02-01',
    location: 'City A',
    narrative: '...',
    moDescription: '...',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const case3: Case = {
    id: 'C3',
    title: 'Case 3',
    date: '2020-03-01',
    location: 'City A',
    narrative: '...',
    moDescription: '...',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open'
  };

  const cases = [case1, case2, case3];

  const linkageLowConfidence: Linkage = {
    id: 'L1',
    caseA: case1,
    caseB: case2,
    confidence: 30, // Below threshold
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '...',
    investigatorStatus: 'pending'
  };

  const linkageRejected: Linkage = {
    id: 'L2',
    caseA: case2,
    caseB: case3,
    confidence: 90,
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '...',
    investigatorStatus: 'rejected' // Rejected
  };

  const clusters = generateCaseClusters(cases, [linkageLowConfidence, linkageRejected]);

  assert.strictEqual(clusters.length, 0); // No valid linkages to form clusters
});
