import { Case, Linkage, CaseCluster } from '../types';

export function findCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  if (!cases || cases.length === 0) return [];

  // Build adjacency list
  // Map of Case ID -> Array of Linkages involving that case
  const adjacencyList = new Map<string, Linkage[]>();
  const caseMap = new Map<string, Case>();

  cases.forEach(c => {
    adjacencyList.set(c.id, []);
    caseMap.set(c.id, c);
  });

  linkages.forEach(link => {
    // Ensure both cases in the linkage actually exist in our cases array
    if (caseMap.has(link.caseA.id) && caseMap.has(link.caseB.id)) {
      adjacencyList.get(link.caseA.id)!.push(link);
      adjacencyList.get(link.caseB.id)!.push(link);
    }
  });

  const visitedCases = new Set<string>();
  const visitedLinkages = new Set<string>();
  const clusters: CaseCluster[] = [];
  let clusterIdCounter = 1;

  cases.forEach(startCase => {
    if (!visitedCases.has(startCase.id)) {
      // Start BFS/DFS for a new connected component
      const clusterCases: Case[] = [];
      const clusterLinkages: Linkage[] = [];

      const queue: string[] = [startCase.id];
      visitedCases.add(startCase.id);

      while (queue.length > 0) {
        const currentCaseId = queue.shift()!;
        const currentCase = caseMap.get(currentCaseId)!;
        clusterCases.push(currentCase);

        const connectedLinks = adjacencyList.get(currentCaseId) || [];
        connectedLinks.forEach(link => {
          if (!visitedLinkages.has(link.id)) {
            visitedLinkages.add(link.id);
            clusterLinkages.push(link);
          }

          const neighborId = link.caseA.id === currentCaseId ? link.caseB.id : link.caseA.id;
          if (!visitedCases.has(neighborId)) {
            visitedCases.add(neighborId);
            queue.push(neighborId);
          }
        });
      }

      // Only consider it a cluster if there's more than one case, or if we want singletons
      // Usually, clusters represent patterns, so a single case is not a cluster.
      // But if there's 1 case with no linkages, we can either ignore it or make it a singleton cluster.
      // Let's only form clusters for connected components with >1 case, or just return them as individual "clusters" too.
      // Based on the instruction to cluster "pairwise case linkages into macro patterns", we should only care about components with linkages.
      // We will only create a cluster if there is at least one linkage (or >1 case).
      if (clusterCases.length > 1) {
        // Calculate common MO categories
        const moCounts = new Map<string, number>();
        clusterCases.forEach(c => {
          c.moCategories.forEach(mo => {
            moCounts.set(mo, (moCounts.get(mo) || 0) + 1);
          });
        });

        // Consider common if it appears in more than half the cases in the cluster
        const commonMoCategories: string[] = [];
        moCounts.forEach((count, mo) => {
          if (count > clusterCases.length / 2) {
            commonMoCategories.push(mo);
          }
        });

        clusters.push({
          id: `CLUSTER-${clusterIdCounter++}`,
          cases: clusterCases,
          linkages: clusterLinkages,
          commonMoCategories
        });
      }
    }
  });

  return clusters;
}
