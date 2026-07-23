import { describe, it } from 'node:test';
import assert from 'node:assert';
import { findEntityHotspots } from './entityHotspots';
import { Case } from '../types';

describe('findEntityHotspots', () => {
  it('should find overlapping entities across cases', () => {
    const cases: Case[] = [
      {
        id: 'C-001',
        title: 'Case 1',
        date: '2023-01-01',
        location: 'City A',
        narrative: '',
        moDescription: '',
        moCategories: [],
        entities: { person: ['John Doe', 'Jane Smith'], vehicle: [], location: [], weapon: [] },
        status: 'open'
      },
      {
        id: 'C-002',
        title: 'Case 2',
        date: '2023-02-01',
        location: 'City B',
        narrative: '',
        moDescription: '',
        moCategories: [],
        entities: { person: ['john doe', 'Bob Jones'], vehicle: [], location: [], weapon: [] },
        status: 'open'
      },
      {
        id: 'C-003',
        title: 'Case 3',
        date: '2023-03-01',
        location: 'City C',
        narrative: '',
        moDescription: '',
        moCategories: [],
        entities: { person: ['Alice'], vehicle: [], location: [], weapon: [] },
        status: 'open'
      }
    ];

    const hotspots = findEntityHotspots(cases);
    assert.strictEqual(hotspots.length, 1);
    assert.strictEqual(hotspots[0].entity, 'john doe');
    assert.strictEqual(hotspots[0].count, 2);
    assert.deepStrictEqual(hotspots[0].caseIds, ['C-001', 'C-002']);
  });

  it('should return empty array if no entities overlap', () => {
    const cases: Case[] = [
      {
        id: 'C-001',
        title: 'Case 1',
        date: '2023-01-01',
        location: 'City A',
        narrative: '',
        moDescription: '',
        moCategories: [],
        entities: { person: ['John Doe'], vehicle: [], location: [], weapon: [] },
        status: 'open'
      },
      {
        id: 'C-002',
        title: 'Case 2',
        date: '2023-02-01',
        location: 'City B',
        narrative: '',
        moDescription: '',
        moCategories: [],
        entities: { person: ['Jane Smith'], vehicle: [], location: [], weapon: [] },
        status: 'open'
      }
    ];

    const hotspots = findEntityHotspots(cases);
    assert.strictEqual(hotspots.length, 0);
  });
});
