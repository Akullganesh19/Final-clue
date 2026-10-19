import { Case } from '../types';

export interface AggregatedEntity {
  name: string;
  count: number;
  caseIds: string[];
}

export interface CrossCaseEntities {
  person: AggregatedEntity[];
  vehicle: AggregatedEntity[];
  location: AggregatedEntity[];
  weapon: AggregatedEntity[];
}

export function analyzeCrossCaseEntities(cases: Case[]): CrossCaseEntities {
  const result = {
    person: {} as Record<string, { count: number; caseIds: Set<string>; originalName: string }>,
    vehicle: {} as Record<string, { count: number; caseIds: Set<string>; originalName: string }>,
    location: {} as Record<string, { count: number; caseIds: Set<string>; originalName: string }>,
    weapon: {} as Record<string, { count: number; caseIds: Set<string>; originalName: string }>
  };

  for (const c of cases) {
    if (!c.entities) continue;

    const types = ['person', 'vehicle', 'location', 'weapon'] as const;

    for (const type of types) {
      const entitiesOfType = c.entities[type] || [];
      for (const entityName of entitiesOfType) {
        if (!entityName) continue;
        const normalized = entityName.toLowerCase().trim();

        if (!result[type][normalized]) {
          result[type][normalized] = {
            count: 0,
            caseIds: new Set<string>(),
            originalName: entityName
          };
        }

        result[type][normalized].count += 1;
        result[type][normalized].caseIds.add(c.id);
      }
    }
  }

  const formatAndSort = (
    record: Record<string, { count: number; caseIds: Set<string>; originalName: string }>
  ): AggregatedEntity[] => {
    return Object.values(record)
      .map(entry => ({
        name: entry.originalName,
        count: entry.count,
        caseIds: Array.from(entry.caseIds).sort()
      }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    person: formatAndSort(result.person),
    vehicle: formatAndSort(result.vehicle),
    location: formatAndSort(result.location),
    weapon: formatAndSort(result.weapon)
  };
}
