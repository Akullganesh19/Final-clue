import { Case, Linkage, CaseCluster } from '../types';

/**
 * Finds case clusters by traversing the graph of case linkages.
 * A cluster is a connected component of cases formed by linkages that meet or exceed the minConfidence.
 */
export function findCaseClusters(cases: Case[], linkages: Linkage[], minConfidence: number = 0): CaseCluster[] {
  if (!cases || !linkages || cases.length === 0 || linkages.length === 0) {
    return [];
  }

  const validLinkages = linkages.filter(link => link.confidence >= minConfidence);

  if (validLinkages.length === 0) {
    return [];
  }

  // Build adjacency list for cases based on valid linkages
  const adjacencyList = new Map<string, string[]>();
  const casesMap = new Map<string, Case>();

  cases.forEach(c => {
    adjacencyList.set(c.id, []);
    casesMap.set(c.id, c);
  });

  validLinkages.forEach(link => {
    // Make sure both cases are in our cases array
    if (casesMap.has(link.caseA.id) && casesMap.has(link.caseB.id)) {
      adjacencyList.get(link.caseA.id)!.push(link.caseB.id);
      adjacencyList.get(link.caseB.id)!.push(link.caseA.id);
    }
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  cases.forEach(c => {
    if (!visited.has(c.id)) {
      const componentCases: Case[] = [];
      const queue: string[] = [c.id];
      visited.add(c.id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentCase = casesMap.get(currentId);
        if (currentCase) {
          componentCases.push(currentCase);
        }

        const neighbors = adjacencyList.get(currentId) || [];
        neighbors.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        });
      }

      // Only consider components with more than 1 case as a cluster
      if (componentCases.length > 1) {
        // Find all linkages that connect cases within this component
        const componentCaseIds = new Set(componentCases.map(caseObj => caseObj.id));
        const componentLinkages = validLinkages.filter(
          link => componentCaseIds.has(link.caseA.id) && componentCaseIds.has(link.caseB.id)
        );

        // Calculate average confidence
        const totalConfidence = componentLinkages.reduce((sum, link) => sum + link.confidence, 0);
        const averageConfidence = componentLinkages.length > 0
          ? totalConfidence / componentLinkages.length
          : 0;

        // Find common MO categories
        const moCounts = new Map<string, number>();
        componentCases.forEach(caseObj => {
          const uniqueMo = new Set(caseObj.moCategories);
          uniqueMo.forEach(mo => {
            moCounts.set(mo, (moCounts.get(mo) || 0) + 1);
          });
        });

        // Consider an MO "common" if it appears in more than 50% of the cases in the cluster
        const commonMoCategories: string[] = [];
        moCounts.forEach((count, mo) => {
          if (count > componentCases.length / 2) {
            commonMoCategories.push(mo);
          }
        });

        clusters.push({
          id: `CLUSTER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cases: componentCases,
          linkages: componentLinkages,
          commonMoCategories,
          averageConfidence
        });
      }
    }
  });

  return clusters;
}
