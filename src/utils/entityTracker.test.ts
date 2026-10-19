import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { generateEntityDossiers } from './entityTracker';
import { Case } from '../types';

describe('generateEntityDossiers', () => {
  const createMockCase = (id: string, title: string, date: string, entities: any): Case => ({
    id,
    title,
    date,
    location: 'Test Location',
    narrative: 'Test narrative',
    moDescription: 'Test MO',
    moCategories: [],
    entities,
    status: 'open'
  });

  it('should extract entities appearing in multiple cases', () => {
    const cases: Case[] = [
      createMockCase('C1', 'Case 1', '2023-01-01', { person: ['John Doe'], vehicle: [], location: [], weapon: [] }),
      createMockCase('C2', 'Case 2', '2023-02-01', { person: ['John Doe', 'Jane Smith'], vehicle: [], location: [], weapon: [] }),
      createMockCase('C3', 'Case 3', '2023-03-01', { person: ['Jane Smith'], vehicle: [], location: [], weapon: [] })
    ];

    const dossiers = generateEntityDossiers(cases);

    assert.strictEqual(dossiers.length, 2);

    const johnDossier = dossiers.find(d => d.entityName.toLowerCase() === 'john doe');
    assert.ok(johnDossier);
    assert.strictEqual(johnDossier!.appearances.length, 2);
    assert.strictEqual(johnDossier!.timespanDays, 31); // Jan 1 to Feb 1

    const janeDossier = dossiers.find(d => d.entityName.toLowerCase() === 'jane smith');
    assert.ok(janeDossier);
    assert.strictEqual(janeDossier!.appearances.length, 2);
  });

  it('should ignore entities that only appear in a single case', () => {
    const cases: Case[] = [
      createMockCase('C1', 'Case 1', '2023-01-01', { person: ['John Doe'], vehicle: ['Red Sedan'], location: [], weapon: [] }),
      createMockCase('C2', 'Case 2', '2023-02-01', { person: [], vehicle: [], location: ['Main St'], weapon: [] })
    ];

    const dossiers = generateEntityDossiers(cases);
    assert.strictEqual(dossiers.length, 0);
  });

  it('should sort appearances chronologically', () => {
    const cases: Case[] = [
      createMockCase('C1', 'Case 1', '2023-03-01', { person: ['John Doe'], vehicle: [], location: [], weapon: [] }),
      createMockCase('C2', 'Case 2', '2023-01-01', { person: ['John Doe'], vehicle: [], location: [], weapon: [] }),
      createMockCase('C3', 'Case 3', '2023-02-01', { person: ['John Doe'], vehicle: [], location: [], weapon: [] })
    ];

    const dossiers = generateEntityDossiers(cases);
    assert.strictEqual(dossiers.length, 1);

    const apps = dossiers[0].appearances;
    assert.strictEqual(apps[0].caseId, 'C2'); // Jan
    assert.strictEqual(apps[1].caseId, 'C3'); // Feb
    assert.strictEqual(apps[2].caseId, 'C1'); // Mar
  });

  it('should not duplicate appearances if entity listed multiple times in same case', () => {
    const cases: Case[] = [
      createMockCase('C1', 'Case 1', '2023-01-01', { person: ['John Doe', 'john doe'], vehicle: [], location: [], weapon: [] }),
      createMockCase('C2', 'Case 2', '2023-02-01', { person: ['John Doe'], vehicle: [], location: [], weapon: [] })
    ];

    const dossiers = generateEntityDossiers(cases);
    assert.strictEqual(dossiers.length, 1);
    assert.strictEqual(dossiers[0].appearances.length, 2);
  });
});
