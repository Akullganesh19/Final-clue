import { Linkage, Case } from '../types';

/**
 * Intelligent Prefetch Predictor
 *
 * Predicts the next cases an investigator is most likely to click on
 * based on the graph of linkages. Used to prefetch case details.
 */
export function predictNextCases(currentCaseId: string, linkages: Linkage[]): Case[] {
  if (!currentCaseId || !linkages || linkages.length === 0) {
    return [];
  }

  // 1. Find all linkages involving the current case
  const adjacentLinkages = linkages.filter(
    link => link.caseA.id === currentCaseId || link.caseB.id === currentCaseId
  );

  // 2. Filter out linkages that shouldn't be prefetched
  const validLinkages = adjacentLinkages.filter(link => {
    // Respect investigator decisions
    if (link.investigatorStatus === 'rejected') {
      return false;
    }

    // Ignore cases where the critic found a severe conflict
    const hasConflict = link.criticFlags?.some(flag => flag.type === 'conflict');
    if (hasConflict) {
      return false;
    }

    return true;
  });

  // 3. Sort by confidence descending
  validLinkages.sort((a, b) => b.confidence - a.confidence);

  // 4. Extract the target cases (up to top 3)
  const predictedCases: Case[] = [];
  for (const link of validLinkages) {
    if (predictedCases.length >= 3) break;

    const targetCase = link.caseA.id === currentCaseId ? link.caseB : link.caseA;
    predictedCases.push(targetCase);
  }

  return predictedCases;
}
