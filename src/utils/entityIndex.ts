import { Case } from '../types';

export interface EntityMatch {
  entityType: keyof Case['entities'];
  entityValue: string;
  cases: { id: string; title: string }[];
}

export function generateEntityOverlapIndex(cases: Case[]): EntityMatch[] {
  const occurrenceMap = new Map<string, { id: string; title: string }[]>();

  for (const c of cases) {
    const caseInfo = { id: c.id, title: c.title };

    if (!c.entities) continue;

    for (const [entityType, entityValues] of Object.entries(c.entities)) {
      const type = entityType as keyof Case['entities'];

      if (!Array.isArray(entityValues)) continue;

      for (const val of entityValues) {
        const normalizedVal = val.trim().toLowerCase();
        if (!normalizedVal) continue;

        const key = `${type}::${normalizedVal}`;
        const existing = occurrenceMap.get(key) || [];

        if (!existing.some(e => e.id === caseInfo.id)) {
          occurrenceMap.set(key, [...existing, caseInfo]);
        }
      }
    }
  }

  const overlaps: EntityMatch[] = [];

  for (const [key, caseList] of occurrenceMap.entries()) {
    if (caseList.length > 1) {
      const [type, ...valParts] = key.split('::');
      const val = valParts.join('::');

      overlaps.push({
        entityType: type as keyof Case['entities'],
        entityValue: val, // Keep lowercase or we'd need to store original casing
        cases: caseList
      });
    }
  }

  overlaps.sort((a, b) => b.cases.length - a.cases.length);

  return overlaps;
}
