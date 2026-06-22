import { Case } from '../types';

export interface EntityOverlap {
  entityType: 'person' | 'vehicle' | 'location' | 'weapon';
  entityValue: string;
  cases: Case[];
}

export function findOverlappingEntities(cases: Case[]): EntityOverlap[] {
  if (!cases || cases.length === 0) {
    return [];
  }

  // Maps to store entity occurrences: map[entityType][entityValue] = Case[]
  const entityMap: Record<string, Map<string, Case[]>> = {
    person: new Map(),
    vehicle: new Map(),
    location: new Map(),
    weapon: new Map()
  };

  // Populate maps
  cases.forEach(c => {
    if (!c.entities) return;

    const types = ['person', 'vehicle', 'location', 'weapon'] as const;
    types.forEach(type => {
      const values = c.entities[type];
      if (Array.isArray(values)) {
        values.forEach(val => {
          const normalizedVal = val.trim().toLowerCase();
          if (!normalizedVal) return;

          const map = entityMap[type];
          if (!map.has(normalizedVal)) {
            map.set(normalizedVal, []);
          }
          // Avoid duplicate cases for the same entity in a single case
          const existingCases = map.get(normalizedVal)!;
          if (!existingCases.some(existing => existing.id === c.id)) {
            existingCases.push(c);
          }
        });
      }
    });
  });

  const overlaps: EntityOverlap[] = [];

  // Find overlaps (entities present in > 1 case)
  Object.keys(entityMap).forEach(type => {
    const map = entityMap[type as keyof typeof entityMap];
    map.forEach((linkedCases, entityValue) => {
      if (linkedCases.length > 1) {
        // Find the original casing of the entity from the first case
        const originalCase = linkedCases[0];
        const originalValues = originalCase.entities[type as keyof typeof originalCase.entities];
        const originalValue = originalValues.find(v => v.toLowerCase() === entityValue) || entityValue;

        overlaps.push({
          entityType: type as any,
          entityValue: originalValue,
          cases: linkedCases
        });
      }
    });
  });

  // Sort overlaps by number of cases involved (descending)
  return overlaps.sort((a, b) => b.cases.length - a.cases.length);
}
