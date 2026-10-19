import test from 'node:test';
import assert from 'node:assert';
import { detectSerialClusters } from './clusterDetection.js';
import { Case, Linkage } from '../types.js';

test('detectSerialClusters should return empty array for empty inputs', () => {
  const result = detectSerialClusters([], []);
  assert.strictEqual(result.length, 0);
});

test('detectSerialClusters should correctly identify a serial cluster', () => {
  const case1: Case = {
    id: 'c1',
    title: 'Case 1',
    date: '2023-01-01',
    location: 'City A',
    narrative: '',
    moDescription: '',
    moCategories: ['Nighttime', 'Home Invasion', 'Weapon: Knife'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open',
  };

  const case2: Case = {
    id: 'c2',
    title: 'Case 2',
    date: '2023-02-01',
    location: 'City B',
    narrative: '',
    moDescription: '',
    moCategories: ['Nighttime', 'Home Invasion', 'Stolen Items'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open',
  };

  const case3: Case = {
    id: 'c3',
    title: 'Case 3',
    date: '2023-03-01',
    location: 'City C',
    narrative: '',
    moDescription: '',
    moCategories: ['Nighttime', 'Home Invasion', 'Solo Victim'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open',
  };

  const case4: Case = {
    id: 'c4',
    title: 'Case 4',
    date: '2023-04-01',
    location: 'City D',
    narrative: '',
    moDescription: '',
    moCategories: ['Daytime', 'Public Space'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'open',
  };

  const cases = [case1, case2, case3, case4];

  const link1: Linkage = {
    id: 'l1',
    caseA: case1,
    caseB: case2,
    confidence: 85,
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '',
    investigatorStatus: 'pending',
  };

  const link2: Linkage = {
    id: 'l2',
    caseA: case2,
    caseB: case3,
    confidence: 90,
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '',
    investigatorStatus: 'pending',
  };

  const link3: Linkage = {
    id: 'l3',
    caseA: case1,
    caseB: case4,
    confidence: 40, // Below threshold
    signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
    evidence: [],
    criticFlags: [],
    summary: '',
    investigatorStatus: 'pending',
  };

  const linkages = [link1, link2, link3];

  const clusters = detectSerialClusters(cases, linkages, 70, 3);

  assert.strictEqual(clusters.length, 1, 'Should find exactly 1 cluster');
  assert.strictEqual(clusters[0].cases.length, 3, 'Cluster should contain 3 cases');

  const clusterIds = clusters[0].cases.map((c) => c.id).sort();
  assert.deepStrictEqual(clusterIds, ['c1', 'c2', 'c3'], 'Cluster should contain c1, c2, and c3');

  const coreMOs = clusters[0].coreMOs.sort();
  assert.deepStrictEqual(coreMOs, ['Home Invasion', 'Nighttime'], 'Core MOs should be Nighttime and Home Invasion');

  assert.strictEqual(clusters[0].totalConfidence, 175, 'Total confidence should be 85 + 90 = 175');
});

test('detectSerialClusters should ignore clusters smaller than minClusterSize', () => {
    const case1: Case = {
        id: 'c1', title: 'Case 1', date: '', location: '', narrative: '', moDescription: '',
        moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open'
    };
    const case2: Case = {
        id: 'c2', title: 'Case 2', date: '', location: '', narrative: '', moDescription: '',
        moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open'
    };

    const cases = [case1, case2];
    const linkages: Linkage[] = [{
        id: 'l1', caseA: case1, caseB: case2, confidence: 95,
        signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
        evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending'
    }];

    const clusters = detectSerialClusters(cases, linkages, 70, 3);
    assert.strictEqual(clusters.length, 0, 'Should not return clusters smaller than 3');
});
