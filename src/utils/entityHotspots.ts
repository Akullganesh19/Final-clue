import { Case } from '../types';

export interface EntityHotspot {
  entity: string;
  type: string;
  count: number;
  caseIds: string[];
}

export function findEntityHotspots(cases: Case[]): EntityHotspot[] {
  const entityMap = new Map<string, { type: string; caseIds: Set<string> }>();

  for (const c of cases) {
    if (!c.entities) continue;
    const types: (keyof Case['entities'])[] = ['person', 'vehicle', 'location', 'weapon'];

    for (const type of types) {
      const entities = c.entities[type];
      if (!entities) continue;

      for (const entity of entities) {
        // Normalize entity string for better matching (lowercase, trim)
        const normalized = entity.toLowerCase().trim();
        if (!normalized) continue;

        const key = `${type}:${normalized}`;
        if (!entityMap.has(key)) {
          entityMap.set(key, { type, caseIds: new Set<string>() });
        }

        entityMap.get(key)!.caseIds.add(c.id);
      }
    }
  }

  const hotspots: EntityHotspot[] = [];
  for (const [key, data] of entityMap.entries()) {
    if (data.caseIds.size > 1) {
      hotspots.push({
        entity: key.split(':')[1],
        type: data.type,
        count: data.caseIds.size,
        caseIds: Array.from(data.caseIds),
      });
    }
  }

  return hotspots.sort((a, b) => b.count - a.count);
}
