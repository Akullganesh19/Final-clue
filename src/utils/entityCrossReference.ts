import { Case } from '../types';

export interface Overlap {
  entityType: keyof Case['entities'];
  value: string;
  caseIds: string[];
}

export function findEntityOverlaps(cases: Case[]): Overlap[] {
  const entityMap = new Map<string, Set<string>>();

  for (const c of cases) {
    const types: (keyof Case['entities'])[] = ['person', 'vehicle', 'location', 'weapon'];
    for (const type of types) {
      const values = c.entities[type];
      if (!values) continue;

      for (const val of values) {
        if (!val.trim()) continue;
        const key = `${type}:${val.toLowerCase().trim()}`;
        if (!entityMap.has(key)) {
          entityMap.set(key, new Set());
        }
        entityMap.get(key)!.add(c.id);
      }
    }
  }

  const overlaps: Overlap[] = [];
  entityMap.forEach((caseIdSet, key) => {
    if (caseIdSet.size > 1) {
      const [type, ...valueParts] = key.split(':');
      overlaps.push({
        entityType: type as keyof Case['entities'],
        value: valueParts.join(':'),
        caseIds: Array.from(caseIdSet)
      });
    }
  });

  return overlaps.sort((a, b) => b.caseIds.length - a.caseIds.length);
}
