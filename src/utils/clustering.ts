import { Case, Linkage, CaseCluster } from '../types';

export function generateCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  // Only consider confirmed or pending linkages that have high confidence
  const validLinkages = linkages.filter(
    (l) => l.investigatorStatus !== 'rejected' && l.confidence >= 50
  );

  // Build an adjacency list for the graph of cases
  const adjacencyList = new Map<string, { neighborId: string; confidence: number }[]>();

  for (const c of cases) {
    adjacencyList.set(c.id, []);
  }

  for (const linkage of validLinkages) {
    if (adjacencyList.has(linkage.caseA.id) && adjacencyList.has(linkage.caseB.id)) {
      adjacencyList.get(linkage.caseA.id)!.push({
        neighborId: linkage.caseB.id,
        confidence: linkage.confidence,
      });
      adjacencyList.get(linkage.caseB.id)!.push({
        neighborId: linkage.caseA.id,
        confidence: linkage.confidence,
      });
    }
  }

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  for (const c of cases) {
    if (!visited.has(c.id)) {
      // Find connected component using BFS
      const componentCases: Case[] = [];
      const queue: string[] = [c.id];
      visited.add(c.id);

      let totalConfidence = 0;
      let linkageCount = 0;

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentCase = cases.find((c) => c.id === currentId);
        if (currentCase) {
          componentCases.push(currentCase);
        }

        const neighbors = adjacencyList.get(currentId) || [];
        for (const { neighborId, confidence } of neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
            totalConfidence += confidence;
            linkageCount++;
          }
        }
      }

      // We only care about clusters of 2 or more cases
      if (componentCases.length >= 2) {
        const clusterCases = componentCases;

        // Find common locations
        const locationsMap = new Map<string, number>();
        for (const cc of clusterCases) {
          locationsMap.set(cc.location, (locationsMap.get(cc.location) || 0) + 1);
        }
        const commonLocations = Array.from(locationsMap.entries())
          .filter(([_, count]) => count >= 2) // Appears in at least 2 cases
          .map(([loc, _]) => loc);

        // Find common MO categories
        const moMap = new Map<string, number>();
        for (const cc of clusterCases) {
          for (const mo of cc.moCategories) {
            moMap.set(mo, (moMap.get(mo) || 0) + 1);
          }
        }
        const coreMoCategories = Array.from(moMap.entries())
          .filter(([_, count]) => count >= 2) // Appears in at least 2 cases
          .map(([mo, _]) => mo);

        // Recalculate average confidence properly based on valid edges between nodes in this component
        let componentTotalConfidence = 0;
        let componentEdgeCount = 0;
        const componentIds = new Set(clusterCases.map(c => c.id));

        for (const linkage of validLinkages) {
            if (componentIds.has(linkage.caseA.id) && componentIds.has(linkage.caseB.id)) {
                componentTotalConfidence += linkage.confidence;
                componentEdgeCount++;
            }
        }

        const avgConfidence = componentEdgeCount > 0 ? componentTotalConfidence / componentEdgeCount : 0;

        clusters.push({
          id: `CLUSTER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cases: clusterCases,
          coreMoCategories,
          commonLocations,
          confidenceScore: avgConfidence,
        });
      }
    }
  }

  return clusters;
}
