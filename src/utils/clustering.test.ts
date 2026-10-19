import test from 'node:test';
import assert from 'node:assert';
import { findCaseClusters } from './clustering';
import { Case, Linkage } from '../types';

test('findCaseClusters - forms serial pattern clusters from A-B and B-C links', () => {
  const caseA: Case = {
    id: 'A', title: 'Case A', date: '2023', location: 'City 1', narrative: '',
    moDescription: '', moCategories: ['MO-1', 'MO-2'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };
  const caseB: Case = {
    id: 'B', title: 'Case B', date: '2023', location: 'City 1', narrative: '',
    moDescription: '', moCategories: ['MO-1'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };
  const caseC: Case = {
    id: 'C', title: 'Case C', date: '2024', location: 'City 2', narrative: '',
    moDescription: '', moCategories: ['MO-1', 'MO-3'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };
  const caseD: Case = {
    id: 'D', title: 'Case D', date: '2024', location: 'City 3', narrative: '',
    moDescription: '', moCategories: ['MO-4'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };

  const linkAB: Linkage = {
    id: 'L1', caseA, caseB, confidence: 80, signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [], criticFlags: [], summary: '', investigatorStatus: 'confirmed'
  };
  const linkBC: Linkage = {
    id: 'L2', caseA: caseB, caseB: caseC, confidence: 90, signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [], criticFlags: [], summary: '', investigatorStatus: 'confirmed'
  };

  const clusters = findCaseClusters([caseA, caseB, caseC, caseD], [linkAB, linkBC]);

  assert.strictEqual(clusters.length, 1);
  const cluster = clusters[0];
  assert.strictEqual(cluster.cases.length, 3);
  assert.strictEqual(cluster.linkages.length, 2);
  assert.strictEqual(cluster.averageConfidence, 85);

  // Case D is isolated
  assert.ok(!cluster.cases.find(c => c.id === 'D'));

  // City 1 has 2, City 2 has 1
  assert.strictEqual(cluster.primaryLocations[0], 'City 1');
  assert.strictEqual(cluster.primaryLocations.length, 2);

  // MO-1 has 3
  assert.strictEqual(cluster.primaryMoCategories[0], 'MO-1');
});

test('findCaseClusters - gracefully handles empty state', () => {
  const clusters = findCaseClusters([], []);
  assert.strictEqual(clusters.length, 0);
});

test('findCaseClusters - filters out rejected and low confidence links', () => {
  const caseA: Case = {
    id: 'A', title: 'Case A', date: '2023', location: 'City 1', narrative: '',
    moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };
  const caseB: Case = {
    id: 'B', title: 'Case B', date: '2023', location: 'City 1', narrative: '',
    moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };
  const caseC: Case = {
    id: 'C', title: 'Case C', date: '2024', location: 'City 2', narrative: '',
    moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold'
  };

  const lowConfidenceLink: Linkage = {
    id: 'L1', caseA, caseB, confidence: 40, signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending'
  };
  const rejectedLink: Linkage = {
    id: 'L2', caseA: caseB, caseB: caseC, confidence: 90, signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [], criticFlags: [], summary: '', investigatorStatus: 'rejected'
  };

  const clusters = findCaseClusters([caseA, caseB, caseC], [lowConfidenceLink, rejectedLink]);
  assert.strictEqual(clusters.length, 0); // No valid clusters should be formed
});
