import { Linkage, Case } from '../types';

// Simple in-memory cache for prefetched case data
const caseCache = new Map<string, Case>();

/**
 * Predictive engine to prefetch cases an investigator is likely to review next.
 * Based on high-confidence, pending linkages.
 *
 * Signal used: Linkage confidence score and 'pending' investigator status.
 */
export function predictAndPrefetchCases(
  linkages: Linkage[],
  fetchCaseFn: (id: string) => Promise<Case>,
  threshold: number = 80
): void {
  // Find pending links with high confidence
  const likelyNextReviews = linkages.filter(
    (l) => l.investigatorStatus === 'pending' && l.confidence >= threshold
  );

  // Extract case IDs that we don't already have in cache
  const idsToFetch = new Set<string>();
  for (const l of likelyNextReviews) {
    if (!caseCache.has(l.caseA.id)) idsToFetch.add(l.caseA.id);
    if (!caseCache.has(l.caseB.id)) idsToFetch.add(l.caseB.id);
  }

  // Silently fetch and cache them in the background
  idsToFetch.forEach((id) => {
    fetchCaseFn(id)
      .then((data) => {
        caseCache.set(id, data);
        // Silently cached for immediate subsequent access
      })
      .catch((_error) => {
        // Degrade gracefully - if it fails, we just don't cache it.
        // User will experience normal load time when they click.
      });
  });
}

/**
 * Retrieve a case from cache if available, or fetch it on demand.
 */
export async function getCaseWithPrediction(
  id: string,
  fetchCaseFn: (id: string) => Promise<Case>
): Promise<Case> {
  if (caseCache.has(id)) {
    return caseCache.get(id)!;
  }

  // Normal on-demand fetch if not predicted or prefetch failed
  const data = await fetchCaseFn(id);
  caseCache.set(id, data);
  return data;
}

/**
 * Clear the cache (mainly for testing or session reset).
 */
export function clearOracleCache(): void {
  caseCache.clear();
}
