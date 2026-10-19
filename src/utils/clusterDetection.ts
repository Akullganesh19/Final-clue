import { Case, Linkage } from '../types';

export interface SerialCluster {
  id: string;
  cases: Case[];
  coreMOs: string[];
  totalConfidence: number;
}

export function detectSerialClusters(
  cases: Case[],
  linkages: Linkage[],
  minConfidence: number = 70,
  minClusterSize: number = 3
): SerialCluster[] {
  if (!cases.length || !linkages.length) {
    return [];
  }

  // Filter linkages by confidence
  const strongLinkages = linkages.filter((l) => l.confidence >= minConfidence);

  // Build adjacency list for cases based on strong linkages
  const adjacencyList = new Map<string, Set<string>>();

  cases.forEach((c) => {
    adjacencyList.set(c.id, new Set<string>());
  });

  strongLinkages.forEach((link) => {
    const caseAId = link.caseA.id;
    const caseBId = link.caseB.id;

    if (adjacencyList.has(caseAId) && adjacencyList.has(caseBId)) {
      adjacencyList.get(caseAId)!.add(caseBId);
      adjacencyList.get(caseBId)!.add(caseAId);
    }
  });

  // Find connected components (clusters)
  const visited = new Set<string>();
  const clusters: string[][] = [];

  for (const caseId of adjacencyList.keys()) {
    if (!visited.has(caseId)) {
      const currentCluster: string[] = [];
      const queue = [caseId];
      visited.add(caseId);

      while (queue.length > 0) {
        const current = queue.shift()!;
        currentCluster.push(current);

        const neighbors = adjacencyList.get(current);
        if (neighbors) {
          neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          });
        }
      }

      if (currentCluster.length >= minClusterSize) {
        clusters.push(currentCluster);
      }
    }
  }

  // Build the final SerialCluster objects
  const serialClusters: SerialCluster[] = [];

  clusters.forEach((clusterIds, index) => {
    const clusterCases = cases.filter((c) => clusterIds.includes(c.id));

    // Find intersecting MOs across all cases in this cluster
    let coreMOs: string[] = [];
    if (clusterCases.length > 0) {
      coreMOs = clusterCases[0].moCategories;
      for (let i = 1; i < clusterCases.length; i++) {
        const currentMOs = new Set(clusterCases[i].moCategories);
        coreMOs = coreMOs.filter((mo) => currentMOs.has(mo));
      }
    }

    // Calculate sum of confidence of all internal linkages
    let totalConfidence = 0;
    const internalLinkages = strongLinkages.filter(
      (link) => clusterIds.includes(link.caseA.id) && clusterIds.includes(link.caseB.id)
    );

    internalLinkages.forEach(link => {
       totalConfidence += link.confidence;
    });

    serialClusters.push({
      id: `CLUSTER-${Date.now()}-${index}`,
      cases: clusterCases,
      coreMOs,
      totalConfidence,
    });
  });

  // Sort clusters by number of cases (descending), then by total confidence
  return serialClusters.sort((a, b) => {
    if (b.cases.length !== a.cases.length) {
      return b.cases.length - a.cases.length;
    }
    return b.totalConfidence - a.totalConfidence;
  });
}
