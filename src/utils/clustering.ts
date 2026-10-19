import { Case, Linkage, CaseCluster } from '../types';

/**
 * Groups pairwise linkages into macro patterns (clusters).
 * Uses a simple graph traversal algorithm (Connected Components).
 */
export function findCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  if (!cases || cases.length === 0 || !linkages || linkages.length === 0) {
    return [];
  }

  // Build adjacency list graph
  const adjList = new Map<string, Set<string>>();

  cases.forEach(c => {
    adjList.set(c.id, new Set<string>());
  });

  linkages.forEach(link => {
    // Make sure nodes exist in graph (might be dealing with partial data)
    if (!adjList.has(link.caseA.id)) adjList.set(link.caseA.id, new Set<string>());
    if (!adjList.has(link.caseB.id)) adjList.set(link.caseB.id, new Set<string>());

    // Assuming undirected graph for linkages
    adjList.get(link.caseA.id)!.add(link.caseB.id);
    adjList.get(link.caseB.id)!.add(link.caseA.id);
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  adjList.forEach((_, startNodeId) => {
    if (!visited.has(startNodeId)) {
      // Find connected component
      const componentCases = new Set<string>();
      const queue: string[] = [startNodeId];
      visited.add(startNodeId);

      while(queue.length > 0) {
        const current = queue.shift()!;
        componentCases.add(current);

        const neighbors = adjList.get(current);
        if (neighbors) {
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          });
        }
      }

      // Filter out isolated nodes (clusters must have > 1 case)
      if (componentCases.size > 1) {
        // Collect actual Case objects
        const clusterCases: Case[] = [];
        componentCases.forEach(caseId => {
          const foundCase = cases.find(c => c.id === caseId);
          if (foundCase) {
             clusterCases.push(foundCase);
          }
        });

        // Collect all internal linkages within this cluster
        const clusterLinkages = linkages.filter(link =>
          componentCases.has(link.caseA.id) && componentCases.has(link.caseB.id)
        );

        // Determine common MO categories
        const moCounts = new Map<string, number>();
        clusterCases.forEach(c => {
          c.moCategories.forEach(mo => {
             moCounts.set(mo, (moCounts.get(mo) || 0) + 1);
          });
        });

        const commonMoCategories: string[] = [];
        moCounts.forEach((count, mo) => {
          if (count === clusterCases.length) { // all cases have this MO
            commonMoCategories.push(mo);
          }
        });

        // If no MO is common to ALL, take ones common to >50%
        if (commonMoCategories.length === 0 && clusterCases.length > 2) {
             moCounts.forEach((count, mo) => {
               if (count > clusterCases.length / 2) {
                 commonMoCategories.push(mo);
               }
             });
        }

        // Calculate overall confidence (average of internal linkage confidences)
        let totalConfidence = 0;
        clusterLinkages.forEach(link => {
           totalConfidence += link.confidence;
        });

        const overallConfidence = clusterLinkages.length > 0
           ? Math.round(totalConfidence / clusterLinkages.length)
           : 0;

        // Auto-generate name based on common MO or location
        let name = `Cluster of ${clusterCases.length} cases`;
        if (commonMoCategories.length > 0) {
           name = `Pattern: ${commonMoCategories[0]} Serial`;
        }

        clusters.push({
          id: `CLUSTER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name,
          cases: clusterCases,
          linkages: clusterLinkages,
          commonMoCategories,
          overallConfidence
        });
      }
    }
  });

  return clusters;
}
