import { test } from 'node:test';
import * as assert from 'node:assert';
import { detectCrimeSeries } from './seriesDetection';
import { Case, Linkage } from '../types';

test('detectCrimeSeries should identify a series from direct and transitive linkages', () => {
  const cases: Case[] = [
    {
      id: 'C1',
      title: 'Case 1',
      date: '2020-01-01',
      location: 'Downtown',
      narrative: '...',
      moDescription: '...',
      moCategories: ['Nighttime', 'Forced Entry'],
      entities: { person: ['Suspect A'], vehicle: ['Red Sedan'], location: [], weapon: ['Knife'] },
      status: 'open'
    },
    {
      id: 'C2',
      title: 'Case 2',
      date: '2020-02-15',
      location: 'Uptown',
      narrative: '...',
      moDescription: '...',
      moCategories: ['Nighttime', 'Forced Entry'],
      entities: { person: ['Suspect A'], vehicle: ['Red Sedan'], location: [], weapon: ['Knife'] },
      status: 'open'
    },
    {
      id: 'C3',
      title: 'Case 3',
      date: '2020-03-10',
      location: 'Midtown',
      narrative: '...',
      moDescription: '...',
      moCategories: ['Nighttime', 'Alleyway'],
      entities: { person: ['Suspect B'], vehicle: ['Red Sedan'], location: [], weapon: ['Gun'] },
      status: 'open'
    },
    {
      id: 'C4', // Unrelated case
      title: 'Case 4',
      date: '2021-01-01',
      location: 'Suburbs',
      narrative: '...',
      moDescription: '...',
      moCategories: ['Daytime'],
      entities: { person: ['Suspect C'], vehicle: ['Blue Truck'], location: [], weapon: ['Bat'] },
      status: 'open'
    }
  ];

  const linkages: Linkage[] = [
    {
      id: 'L1',
      caseA: cases[0],
      caseB: cases[1],
      confidence: 85,
      signals: { semantic: 0.8, entity: 0.9, temporal: 0.7, mo: 0.8 },
      evidence: [],
      criticFlags: [],
      summary: 'Strong match',
      investigatorStatus: 'pending'
    },
    {
      id: 'L2',
      caseA: cases[1],
      caseB: cases[2],
      confidence: 78,
      signals: { semantic: 0.7, entity: 0.7, temporal: 0.8, mo: 0.7 },
      evidence: [],
      criticFlags: [],
      summary: 'Moderate match',
      investigatorStatus: 'pending'
    }
  ];

  // A linked to B, B linked to C. C1, C2, C3 should form a series.
  const series = detectCrimeSeries(cases, linkages, 75);

  assert.strictEqual(series.length, 1);
  assert.strictEqual(series[0].caseIds.length, 3);
  assert.ok(series[0].caseIds.includes('C1'));
  assert.ok(series[0].caseIds.includes('C2'));
  assert.ok(series[0].caseIds.includes('C3'));

  // Shared entities across all 3 cases
  assert.deepStrictEqual(series[0].coreEntities.vehicle, ['Red Sedan']);
  assert.deepStrictEqual(series[0].coreEntities.person, []); // Suspect A is not in C3
  assert.deepStrictEqual(series[0].sharedMoCategories, ['Nighttime']); // Shared by all 3

  // Time span
  assert.strictEqual(series[0].timeSpan.start, '2020-01-01');
  assert.strictEqual(series[0].timeSpan.end, '2020-03-10');

  // Avg confidence (85 + 78) / 2 = 81.5 = 82
  assert.strictEqual(series[0].confidenceScore, 82);
});

test('detectCrimeSeries should ignore rejected or low confidence linkages', () => {
    const cases: Case[] = [
        { id: 'C1', title: 'Case 1', date: '2020-01-01', location: '', narrative: '', moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open' },
        { id: 'C2', title: 'Case 2', date: '2020-02-15', location: '', narrative: '', moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open' },
    ];

    const linkages: Linkage[] = [
        {
          id: 'L1',
          caseA: cases[0],
          caseB: cases[1],
          confidence: 70, // Below 75 threshold
          signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
          evidence: [],
          criticFlags: [],
          summary: '',
          investigatorStatus: 'pending'
        }
    ];

    const series = detectCrimeSeries(cases, linkages, 75);
    assert.strictEqual(series.length, 0);

    const linkages2: Linkage[] = [
        {
          id: 'L1',
          caseA: cases[0],
          caseB: cases[1],
          confidence: 90, // High confidence, but rejected
          signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 },
          evidence: [],
          criticFlags: [],
          summary: '',
          investigatorStatus: 'rejected'
        }
    ];

    const series2 = detectCrimeSeries(cases, linkages2, 75);
    assert.strictEqual(series2.length, 0);
});
