import test from 'node:test';
import assert from 'node:assert';
import { generateEntityOverlapIndex } from './entityIndex';
import { Case } from '../types';

test('generateEntityOverlapIndex correctly identifies overlapping entities', () => {
  const cases: Case[] = [
    {
      id: "1",
      title: "Case 1",
      date: "2024-01-01",
      location: "A",
      narrative: "test",
      moDescription: "test",
      moCategories: [],
      entities: { person: ["John Doe", "Jane"], vehicle: ["Car A"], location: [], weapon: [] },
      status: "open"
    },
    {
      id: "2",
      title: "Case 2",
      date: "2024-01-02",
      location: "B",
      narrative: "test",
      moDescription: "test",
      moCategories: [],
      entities: { person: ["Jane", "Bob"], vehicle: ["Car B", "Car A"], location: [], weapon: [] },
      status: "open"
    },
    {
      id: "3",
      title: "Case 3",
      date: "2024-01-03",
      location: "C",
      narrative: "test",
      moDescription: "test",
      moCategories: [],
      entities: { person: ["John Doe"], vehicle: ["Car C"], location: [], weapon: [] },
      status: "open"
    }
  ];

  const overlaps = generateEntityOverlapIndex(cases);

  assert.strictEqual(overlaps.length, 3, 'Should find exactly 3 overlapping entities (jane, john doe, car a)');

  const janeOverlap = overlaps.find(o => o.entityValue === 'jane');
  assert.ok(janeOverlap, 'Should find overlap for Jane');
  assert.strictEqual(janeOverlap.entityType, 'person');
  assert.strictEqual(janeOverlap.cases.length, 2);
  assert.ok(janeOverlap.cases.some(c => c.id === '1'));
  assert.ok(janeOverlap.cases.some(c => c.id === '2'));

  const johnOverlap = overlaps.find(o => o.entityValue === 'john doe');
  assert.ok(johnOverlap, 'Should find overlap for John Doe');
  assert.strictEqual(johnOverlap.entityType, 'person');
  assert.strictEqual(johnOverlap.cases.length, 2);
  assert.ok(johnOverlap.cases.some(c => c.id === '1'));
  assert.ok(johnOverlap.cases.some(c => c.id === '3'));

  const carOverlap = overlaps.find(o => o.entityValue === 'car a');
  assert.ok(carOverlap, 'Should find overlap for Car A');
  assert.strictEqual(carOverlap.entityType, 'vehicle');
  assert.strictEqual(carOverlap.cases.length, 2);
  assert.ok(carOverlap.cases.some(c => c.id === '1'));
  assert.ok(carOverlap.cases.some(c => c.id === '2'));
});

test('generateEntityOverlapIndex ignores empty arrays and single occurrences', () => {
  const cases: Case[] = [
    {
      id: "1",
      title: "Case 1",
      date: "2024-01-01",
      location: "A",
      narrative: "test",
      moDescription: "test",
      moCategories: [],
      entities: { person: ["Unique Person"], vehicle: [], location: [], weapon: [] },
      status: "open"
    },
    {
      id: "2",
      title: "Case 2",
      date: "2024-01-02",
      location: "B",
      narrative: "test",
      moDescription: "test",
      moCategories: [],
      entities: { person: ["Another Person"], vehicle: [], location: [], weapon: [] },
      status: "open"
    }
  ];

  const overlaps = generateEntityOverlapIndex(cases);
  assert.strictEqual(overlaps.length, 0, 'Should find no overlaps');
});
