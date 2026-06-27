import { Case, EntityRadarData, HotEntity } from '../types';

export function computeEntityRadar(cases: Case[]): EntityRadarData {
  const entityMap: Record<string, HotEntity> = {};

  cases.forEach(c => {
    const processEntity = (entityName: string, type: HotEntity['type']) => {
      // Normalize to lowercase for counting, but preserve the original casing in 'name' if it's the first time we see it
      const key = `${type}-${entityName.toLowerCase()}`;
      if (!entityMap[key]) {
        entityMap[key] = {
          name: entityName,
          type,
          count: 0,
          caseIds: []
        };
      }
      entityMap[key].count += 1;
      if (!entityMap[key].caseIds.includes(c.id)) {
        entityMap[key].caseIds.push(c.id);
      }
    };

    c.entities.person?.forEach(e => processEntity(e, 'person'));
    c.entities.vehicle?.forEach(e => processEntity(e, 'vehicle'));
    c.entities.location?.forEach(e => processEntity(e, 'location'));
    c.entities.weapon?.forEach(e => processEntity(e, 'weapon'));
  });

  const radar: EntityRadarData = {
    persons: [],
    vehicles: [],
    locations: [],
    weapons: []
  };

  Object.values(entityMap).forEach(entity => {
    switch(entity.type) {
      case 'person': radar.persons.push(entity); break;
      case 'vehicle': radar.vehicles.push(entity); break;
      case 'location': radar.locations.push(entity); break;
      case 'weapon': radar.weapons.push(entity); break;
    }
  });

  // Sort each array by count descending
  radar.persons.sort((a, b) => b.count - a.count);
  radar.vehicles.sort((a, b) => b.count - a.count);
  radar.locations.sort((a, b) => b.count - a.count);
  radar.weapons.sort((a, b) => b.count - a.count);

  return radar;
}
