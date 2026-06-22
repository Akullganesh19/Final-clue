import test from 'node:test';
import assert from 'node:assert';
import { findOverlappingEntities } from './entityCrossReference';
import { Case } from '../types';

test('findOverlappingEntities detects shared entities', () => {
  const case1: Case = {
    id: '1',
    title: 'Case 1',
    date: '2023-01-01',
    location: 'City A',
    narrative: '',
    moDescription: '',
    moCategories: [],
    status: 'open',
    entities: {
      person: ['John Doe'],
      vehicle: ['Red Honda'],
      location: [],
      weapon: ['9mm']
    }
  };

  const case2: Case = {
    id: '2',
    title: 'Case 2',
    date: '2023-02-01',
    location: 'City B',
    narrative: '',
    moDescription: '',
    moCategories: [],
    status: 'open',
    entities: {
      person: ['Jane Doe'],
      vehicle: ['Red Honda', 'Blue Ford'],
      location: [],
      weapon: []
    }
  };

  const case3: Case = {
    id: '3',
    title: 'Case 3',
    date: '2023-03-01',
    location: 'City C',
    narrative: '',
    moDescription: '',
    moCategories: [],
    status: 'open',
    entities: {
      person: ['John Doe'],
      vehicle: [],
      location: [],
      weapon: ['9mm']
    }
  };

  const overlaps = findOverlappingEntities([case1, case2, case3]);

  assert.strictEqual(overlaps.length, 3);

  // Person overlap (John Doe in case 1 and 3)
  const personOverlap = overlaps.find(o => o.entityType === 'person' && o.entityValue.toLowerCase() === 'john doe');
  assert.ok(personOverlap);
  assert.strictEqual(personOverlap.cases.length, 2);

  // Vehicle overlap (Red Honda in case 1 and 2)
  const vehicleOverlap = overlaps.find(o => o.entityType === 'vehicle' && o.entityValue.toLowerCase() === 'red honda');
  assert.ok(vehicleOverlap);
  assert.strictEqual(vehicleOverlap.cases.length, 2);

  // Weapon overlap (9mm in case 1 and 3)
  const weaponOverlap = overlaps.find(o => o.entityType === 'weapon' && o.entityValue.toLowerCase() === '9mm');
  assert.ok(weaponOverlap);
  assert.strictEqual(weaponOverlap.cases.length, 2);
});

test('findOverlappingEntities handles empty input', () => {
  assert.deepStrictEqual(findOverlappingEntities([]), []);
});
