import { Case } from '../types';

export interface EntityOverlap {
  entityType: 'person' | 'vehicle' | 'location' | 'weapon';
  entityName: string;
  cases: Case[];
}

export function findEntityOverlaps(cases: Case[]): EntityOverlap[] {
  const entityMap = new Map<string, { type: 'person' | 'vehicle' | 'location' | 'weapon'; cases: Set<Case> }>();

  cases.forEach(c => {
    const processEntities = (entities: string[], type: 'person' | 'vehicle' | 'location' | 'weapon') => {
      entities.forEach(entity => {
        const normalizedEntity = entity.toLowerCase().trim();
        if (!normalizedEntity) return;

        const key = `${type}:${normalizedEntity}`;
        if (!entityMap.has(key)) {
          entityMap.set(key, { type, cases: new Set() });
        }
        entityMap.get(key)!.cases.add(c);
      });
    };

    processEntities(c.entities.person, 'person');
    processEntities(c.entities.vehicle, 'vehicle');
    processEntities(c.entities.location, 'location');
    processEntities(c.entities.weapon, 'weapon');
  });

  const overlaps: EntityOverlap[] = [];

  entityMap.forEach((value, key) => {
    if (value.cases.size > 1) {
      const entityName = key.split(':')[1];
      overlaps.push({
        entityType: value.type,
        // capitalize first letter for display
        entityName: entityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        cases: Array.from(value.cases)
      });
    }
  });

  // Sort by number of cases involved, then alphabetically
  return overlaps.sort((a, b) => {
    if (b.cases.length !== a.cases.length) {
      return b.cases.length - a.cases.length;
    }
    return a.entityName.localeCompare(b.entityName);
  });
}
