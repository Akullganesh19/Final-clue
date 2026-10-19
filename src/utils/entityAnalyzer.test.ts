import test from 'node:test';
import assert from 'node:assert';
import { analyzeCrossCaseEntities } from './entityAnalyzer';
import { Case } from '../types';

test('analyzeCrossCaseEntities correctly aggregates and sorts entities case-insensitively', () => {
  const cases: Case[] = [
    {
      id: '1',
      title: 'A',
      date: '2020',
      location: 'A',
      narrative: 'A',
      moDescription: 'A',
      moCategories: [],
      status: 'cold',
      entities: {
        person: ['John Doe', 'Jane Smith'],
        vehicle: ['White Van'],
        location: ['Park'],
        weapon: ['Gun']
      }
    },
    {
      id: '2',
      title: 'B',
      date: '2020',
      location: 'B',
      narrative: 'B',
      moDescription: 'B',
      moCategories: [],
      status: 'cold',
      entities: {
        person: ['JOHN DOE', 'Bob'],
        vehicle: ['white van', 'Red Car'],
        location: ['PARK'],
        weapon: ['Knife']
      }
    }
  ];

  const result = analyzeCrossCaseEntities(cases);

  // Assert Person
  const personDoe = result.person.find(p => p.name.toLowerCase() === 'john doe');
  assert.ok(personDoe, 'John Doe should be found');
  assert.strictEqual(personDoe.count, 2);
  assert.deepStrictEqual(personDoe.caseIds, ['1', '2']);

  const personSmith = result.person.find(p => p.name.toLowerCase() === 'jane smith');
  assert.ok(personSmith, 'Jane Smith should be found');
  assert.strictEqual(personSmith.count, 1);

  // Assert Vehicle
  const van = result.vehicle.find(v => v.name.toLowerCase() === 'white van');
  assert.ok(van, 'White Van should be found');
  assert.strictEqual(van.count, 2);
  assert.deepStrictEqual(van.caseIds, ['1', '2']);

  // Assert Location
  const park = result.location.find(l => l.name.toLowerCase() === 'park');
  assert.ok(park, 'Park should be found');
  assert.strictEqual(park.count, 2);

  // Assert sorting (highest count first)
  assert.strictEqual(result.person[0].name.toLowerCase(), 'john doe');
});

test('analyzeCrossCaseEntities handles cases with missing entities object', () => {
  const cases = [
    { id: '1', entities: { person: ['A'] } } as Case,
    { id: '2' } as Case
  ];

  const result = analyzeCrossCaseEntities(cases);
  assert.strictEqual(result.person.length, 1);
  assert.strictEqual(result.person[0].count, 1);
});
