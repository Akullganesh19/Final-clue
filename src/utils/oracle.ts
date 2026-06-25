import { Case } from '../types';

/**
 * Predicts the next most likely case an investigator will want to examine
 * based on entity overlap and Modus Operandi (MO) similarities with the current case.
 *
 * Signal used:
 * - Shared entities (weapons, vehicles) strongly predict next-case relevance.
 * - Shared MO categories provide secondary prediction signals.
 *
 * This engine allows the UI to prefetch cases the investigator is highly likely
 * to explore next, dramatically reducing perceived load times for related investigations.
 */
export function OraclePredictor(currentCase: Case, allCases: Case[]): Case[] {
  if (!currentCase || !allCases || allCases.length === 0) return [];

  const scoredCases = allCases
    .filter(c => c.id !== currentCase.id) // Don't predict the case we're already on
    .map(c => {
      let score = 0;

      // Highly predictive signal: Shared weapons (+5 points each)
      const sharedWeapons = currentCase.entities.weapon.filter(w => c.entities.weapon.includes(w));
      score += sharedWeapons.length * 5;

      // Highly predictive signal: Shared vehicles (+4 points each)
      const sharedVehicles = currentCase.entities.vehicle.filter(v => c.entities.vehicle.includes(v));
      score += sharedVehicles.length * 4;

      // Secondary signal: Shared MO categories (+2 points each)
      const sharedMo = currentCase.moCategories.filter(mo => c.moCategories.includes(mo));
      score += sharedMo.length * 2;

      return { case: c, score };
    });

  // Return the top 3 highest scoring cases that have at least some relation
  return scoredCases
    .filter(sc => sc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(sc => sc.case);
}

// Simple in-memory cache for prefetched cases
const predictionCache = new Map<string, Case>();

/**
 * Background utility to gracefully prefetch and cache predicted cases.
 * Interacts with a hypothetical API or data store to load predicted cases.
 */
export async function prefetchPredicted(currentCase: Case, allCases: Case[], fetchCaseData: (id: string) => Promise<Case | null>): Promise<void> {
  try {
    // 1. Predict what's needed next
    const predictedCases = OraclePredictor(currentCase, allCases);

    // 2. Prefetch in the background, handling errors gracefully per case
    const fetchPromises = predictedCases.map(async (pCase) => {
      // Skip if we already cached it
      if (predictionCache.has(pCase.id)) return;

      try {
        // Attempt to fetch, representing normal flow taking over if this fails
        const data = await fetchCaseData(pCase.id);
        if (data) {
          // Emulate permission check: Only cache if status is valid (mock check)
          // In a real app, fetchCaseData would handle permission validation or throw
          predictionCache.set(data.id, data);
        }
      } catch (err) {
        // Degrade gracefully: If prediction fails to fetch, we just don't cache it.
        // The normal UI click will attempt to fetch and handle the error formally.
        console.warn(`Oracle: Failed to prefetch predicted case ${pCase.id}`, err);
      }
    });

    await Promise.allSettled(fetchPromises);
  } catch (error) {
    // Top level catch ensures the prefetcher never crashes the main app flow
    console.error('Oracle: Prediction engine encountered a fatal error during prefetch', error);
  }
}

// Utility to retrieve a prefetched case if it exists
export function getPrefetchedCase(id: string): Case | undefined {
  return predictionCache.get(id);
}

// Utility to clear cache (mostly for tests)
export function clearPredictionCache(): void {
  predictionCache.clear();
}
