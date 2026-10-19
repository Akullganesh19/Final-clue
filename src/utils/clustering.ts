import { Case, Linkage, CaseCluster } from '../types';

/**
 * Finds and groups connected case clusters using breadth-first search.
 * It ignores low confidence (<50) or rejected linkages to form high-quality clusters.
 */
export function findCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  if (!cases || cases.length === 0 || !linkages || linkages.length === 0) {
    return [];
  }

  // Filter out rejected or low confidence linkages
  const validLinkages = linkages.filter(
    (l) => l.investigatorStatus !== 'rejected' && l.confidence >= 50
  );

  // Build adjacency list for cases
  const adjacencyList = new Map<string, { caseInfo: Case, connectedLinks: Linkage[] }>();

  cases.forEach(c => {
    adjacencyList.set(c.id, { caseInfo: c, connectedLinks: [] });
  });

  validLinkages.forEach(link => {
    const caseAId = link.caseA.id;
    const caseBId = link.caseB.id;

    if (adjacencyList.has(caseAId)) {
      adjacencyList.get(caseAId)!.connectedLinks.push(link);
    }
    if (adjacencyList.has(caseBId)) {
      adjacencyList.get(caseBId)!.connectedLinks.push(link);
    }
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  cases.forEach(startCase => {
    if (!visited.has(startCase.id)) {
      const clusterCases = new Map<string, Case>();
      const clusterLinkages = new Map<string, Linkage>();

      const queue: string[] = [startCase.id];
      visited.add(startCase.id);

      while (queue.length > 0) {
        const currentCaseId = queue.shift()!;
        const node = adjacencyList.get(currentCaseId);

        if (node) {
          clusterCases.set(currentCaseId, node.caseInfo);

          node.connectedLinks.forEach(link => {
            clusterLinkages.set(link.id, link);
            const neighborId = link.caseA.id === currentCaseId ? link.caseB.id : link.caseA.id;
            if (!visited.has(neighborId)) {
              visited.add(neighborId);
              queue.push(neighborId);
            }
          });
        }
      }

      // A cluster must have more than one case
      if (clusterCases.size > 1) {
        const casesArray = Array.from(clusterCases.values());
        const linkagesArray = Array.from(clusterLinkages.values());

        const totalConfidence = linkagesArray.reduce((sum, link) => sum + link.confidence, 0);
        const averageConfidence = linkagesArray.length > 0 ? totalConfidence / linkagesArray.length : 0;

        // Count locations and MO categories to find primary ones
        const locationCounts = new Map<string, number>();
        const moCounts = new Map<string, number>();

        casesArray.forEach(c => {
          if (c.location) {
            locationCounts.set(c.location, (locationCounts.get(c.location) || 0) + 1);
          }
          c.moCategories.forEach(mo => {
            moCounts.set(mo, (moCounts.get(mo) || 0) + 1);
          });
        });

        // Get top 2 locations
        const primaryLocations = Array.from(locationCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(entry => entry[0]);

        // Get top 3 MO categories
        const primaryMoCategories = Array.from(moCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);

        clusters.push({
          id: `CLUSTER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cases: casesArray,
          linkages: linkagesArray,
          averageConfidence,
          primaryLocations,
          primaryMoCategories
        });
      }
    }
  });

  return clusters;
}
