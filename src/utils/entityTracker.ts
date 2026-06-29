import { Case } from '../types';

export interface EntityAppearance {
  caseId: string;
  caseTitle: string;
  date: string;
  entityType: 'person' | 'vehicle' | 'location' | 'weapon';
}

export interface EntityDossier {
  entityName: string;
  entityType: 'person' | 'vehicle' | 'location' | 'weapon';
  appearances: EntityAppearance[];
  timespanDays: number;
}

export function generateEntityDossiers(cases: Case[]): EntityDossier[] {
  const entityMap = new Map<string, EntityAppearance[]>();
  const entityTypeMap = new Map<string, 'person' | 'vehicle' | 'location' | 'weapon'>();

  cases.forEach(c => {
    const types: ('person' | 'vehicle' | 'location' | 'weapon')[] = ['person', 'vehicle', 'location', 'weapon'];
    types.forEach(type => {
      if (c.entities && c.entities[type]) {
        c.entities[type].forEach(entityName => {
          const normalizedName = entityName.toLowerCase().trim();
          if (!entityMap.has(normalizedName)) {
            entityMap.set(normalizedName, []);
            entityTypeMap.set(normalizedName, type);
          }

          // Check if this case is already in the appearances to avoid duplicates within same case
          const existingAppearances = entityMap.get(normalizedName)!;
          if (!existingAppearances.some(app => app.caseId === c.id)) {
            existingAppearances.push({
              caseId: c.id,
              caseTitle: c.title,
              date: c.date,
              entityType: type
            });
          }
        });
      }
    });
  });

  const dossiers: EntityDossier[] = [];

  entityMap.forEach((appearances, entityName) => {
    // Only interested in entities that appear in more than one case
    if (appearances.length > 1) {
      // Sort chronologically
      appearances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate timespan
      const firstDate = new Date(appearances[0].date);
      const lastDate = new Date(appearances[appearances.length - 1].date);
      const timespanDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

      // Get the original casing for the name (just picking from the first appearance's original if possible, but we don't have it saved easily. Let's just title-case it.)
      const displayTitle = entityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      dossiers.push({
        entityName: displayTitle,
        entityType: entityTypeMap.get(entityName)!,
        appearances,
        timespanDays
      });
    }
  });

  // Sort dossiers by number of appearances descending, then by timespan descending
  return dossiers.sort((a, b) => {
    if (b.appearances.length !== a.appearances.length) {
      return b.appearances.length - a.appearances.length;
    }
    return b.timespanDays - a.timespanDays;
  });
}
