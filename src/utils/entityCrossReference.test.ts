import { describe, it } from 'node:test';
import assert from 'node:assert';
import { findEntityOverlaps } from './entityCrossReference';
import { Case } from '../types';

describe('findEntityOverlaps', () => {
  it('should find overlapping entities across multiple cases', () => {
    const mockCases: Case[] = [
      {
        id: 'case-1',
        title: 'Case 1',
        date: '2023-01-01',
        location: 'City A',
        narrative: '...',
        moDescription: '...',
        moCategories: [],
        entities: {
          person: ['John Doe'],
          vehicle: ['Red Honda Civic'],
          location: [],
          weapon: ['9mm Glock']
        },
        status: 'open'
      },
      {
        id: 'case-2',
        title: 'Case 2',
        date: '2023-02-01',
        location: 'City B',
        narrative: '...',
        moDescription: '...',
        moCategories: [],
        entities: {
          person: ['Jane Doe'],
          vehicle: ['Red Honda Civic'], // Overlap
          location: [],
          weapon: ['Knife']
        },
        status: 'open'
      },
      {
        id: 'case-3',
        title: 'Case 3',
        date: '2023-03-01',
        location: 'City C',
        narrative: '...',
        moDescription: '...',
        moCategories: [],
        entities: {
          person: ['John Smith'],
          vehicle: ['Blue Ford Focus'],
          location: [],
          weapon: ['9mm glock'] // Overlap (case-insensitive)
        },
        status: 'open'
      }
    ];

    const overlaps = findEntityOverlaps(mockCases);

    assert.strictEqual(overlaps.length, 2);

    const vehicleOverlap = overlaps.find(o => o.entityType === 'vehicle' && o.value === 'red honda civic');
    assert.ok(vehicleOverlap);
    assert.deepStrictEqual(vehicleOverlap.caseIds.sort(), ['case-1', 'case-2'].sort());

    const weaponOverlap = overlaps.find(o => o.entityType === 'weapon' && o.value === '9mm glock');
    assert.ok(weaponOverlap);
    assert.deepStrictEqual(weaponOverlap.caseIds.sort(), ['case-1', 'case-3'].sort());
  });

  it('should return empty array if no overlaps exist', () => {
    const mockCases: Case[] = [
      {
        id: 'case-1',
        title: 'Case 1',
        date: '2023-01-01',
        location: 'City A',
        narrative: '...',
        moDescription: '...',
        moCategories: [],
        entities: {
          person: ['John Doe'],
          vehicle: ['Red Honda Civic'],
          location: [],
          weapon: ['9mm Glock']
        },
        status: 'open'
      },
      {
        id: 'case-2',
        title: 'Case 2',
        date: '2023-02-01',
        location: 'City B',
        narrative: '...',
        moDescription: '...',
        moCategories: [],
        entities: {
          person: ['Jane Doe'],
          vehicle: ['Blue Ford Focus'],
          location: [],
          weapon: ['Knife']
        },
        status: 'open'
      }
    ];

    const overlaps = findEntityOverlaps(mockCases);
    assert.strictEqual(overlaps.length, 0);
  });
});
