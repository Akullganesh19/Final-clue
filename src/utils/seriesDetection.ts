import { Case, Linkage } from '../types';

export interface CrimeSeries {
  id: string;
  caseIds: string[];
  cases: Case[];
  coreEntities: {
    person: string[];
    vehicle: string[];
    location: string[];
    weapon: string[];
  };
  sharedMoCategories: string[];
  timeSpan: {
    start: string;
    end: string;
  };
  confidenceScore: number;
}

/**
 * Detects connected components of crime cases (crime series) based on linkages.
 * It uses graph traversal (BFS/DFS) to group cases that share confirmed or high-confidence linkages.
 *
 * @param cases Array of all cases in the system
 * @param linkages Array of direct linkages between cases
 * @param confidenceThreshold Minimum confidence score (0-100) to consider a linkage valid for a series
 */
export function detectCrimeSeries(cases: Case[], linkages: Linkage[], confidenceThreshold: number = 75): CrimeSeries[] {
  // Build adjacency list for cases that are linked with confidence >= threshold
  const adjList = new Map<string, string[]>();

  // Initialize adjacency list
  for (const c of cases) {
    adjList.set(c.id, []);
  }

  // Populate edges based on linkages
  const validLinkages = linkages.filter(link =>
    link.confidence >= confidenceThreshold && link.investigatorStatus !== 'rejected'
  );

  for (const link of validLinkages) {
    const aId = link.caseA.id;
    const bId = link.caseB.id;
    if (adjList.has(aId) && adjList.has(bId)) {
      adjList.get(aId)!.push(bId);
      adjList.get(bId)!.push(aId);
    }
  }

  const visited = new Set<string>();
  const seriesList: CrimeSeries[] = [];
  let seriesCounter = 1;

  for (const c of cases) {
    if (!visited.has(c.id)) {
      // Find connected component
      const componentIds: string[] = [];
      const queue = [c.id];
      visited.add(c.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        componentIds.push(curr);

        const neighbors = adjList.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      // Only consider it a series if there are at least 2 cases
      if (componentIds.length > 1) {
        const seriesCases = componentIds.map(id => cases.find(c => c.id === id)!).filter(Boolean);

        // Calculate shared features
        const series = buildCrimeSeries(seriesCases, seriesCounter++);

        // Calculate average confidence for the linkages in this component
        let totalConfidence = 0;
        let internalLinks = 0;
        for (const link of validLinkages) {
          if (componentIds.includes(link.caseA.id) && componentIds.includes(link.caseB.id)) {
             totalConfidence += link.confidence;
             internalLinks++;
          }
        }
        series.confidenceScore = internalLinks > 0 ? Math.round(totalConfidence / internalLinks) : 0;

        seriesList.push(series);
      }
    }
  }

  return seriesList.sort((a, b) => b.caseIds.length - a.caseIds.length || b.confidenceScore - a.confidenceScore);
}

function buildCrimeSeries(seriesCases: Case[], seriesIndex: number): CrimeSeries {
  // Find time span
  let minDate = new Date('9999-12-31').getTime();
  let maxDate = new Date('1970-01-01').getTime();

  let startStr = '';
  let endStr = '';

  for (const c of seriesCases) {
    const d = new Date(c.date).getTime();
    if (!isNaN(d)) {
      if (d < minDate) {
        minDate = d;
        startStr = c.date;
      }
      if (d > maxDate) {
        maxDate = d;
        endStr = c.date;
      }
    }
  }

  // Find shared entities (intersection of entities across ALL cases in the series)
  const sharedEntities = {
    person: getIntersection(seriesCases.map(c => c.entities?.person || [])),
    vehicle: getIntersection(seriesCases.map(c => c.entities?.vehicle || [])),
    location: getIntersection(seriesCases.map(c => c.entities?.location || [])),
    weapon: getIntersection(seriesCases.map(c => c.entities?.weapon || []))
  };

  // Find shared MO categories
  const sharedMoCategories = getIntersection(seriesCases.map(c => c.moCategories || []));

  return {
    id: `SERIES-${new Date().getFullYear()}-${seriesIndex.toString().padStart(3, '0')}`,
    caseIds: seriesCases.map(c => c.id),
    cases: seriesCases,
    coreEntities: sharedEntities,
    sharedMoCategories,
    timeSpan: {
      start: startStr,
      end: endStr
    },
    confidenceScore: 0 // Will be set by caller
  };
}

function getIntersection(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  let intersection = new Set(arrays[0]);

  for (let i = 1; i < arrays.length; i++) {
    const currentSet = new Set(arrays[i]);
    for (const item of intersection) {
      if (!currentSet.has(item)) {
        intersection.delete(item);
      }
    }
  }

  return Array.from(intersection);
}
