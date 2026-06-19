import { Linkage } from '../types';

/**
 * 🛸 Oracle Prediction Engine
 *
 * Predicts and pre-computes case linkages when a user views a cold case.
 *
 * Signal used: Case view event.
 * Prediction: The investigator will likely want to see linked cases next.
 * Impact: Heavy similarity matching is done in the background. When the user
 * clicks "View Linkages", the data is already there (zero latency).
 */
class OracleEngine {
  private cache = new Map<string, { linkages: Linkage[], expiresAt: number }>();
  private inflight = new Set<string>();

  // In a real app, this would be an API call to a similarity engine.
  // We simulate it here as a heavy background job.
  private async computeLinkages(caseId: string): Promise<Linkage[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([]); // Simulated results
      }, 1500); // Simulated 1.5s latency
    });
  }

  /**
   * Signal hook. Call this when the user views a case.
   * Oracle detects the signal and begins pre-fetching linkages in the background.
   */
  public notifyCaseViewed(caseId: string, hasPermission: boolean = true) {
    if (!hasPermission) return; // Never prefetch without permission

    // Already cached or in-flight?
    if (this.cache.has(caseId)) {
        const entry = this.cache.get(caseId);
        if (entry && entry.expiresAt > Date.now()) return;
    }
    if (this.inflight.has(caseId)) return;

    this.inflight.add(caseId);

    // Background job
    this.computeLinkages(caseId)
      .then(linkages => {
        // Cache for 5 minutes
        this.cache.set(caseId, { linkages, expiresAt: Date.now() + 5 * 60 * 1000 });
      })
      .catch(err => {
        console.error("Oracle background prediction failed:", err);
      })
      .finally(() => {
        this.inflight.delete(caseId);
      });
  }

  /**
   * Get pre-computed linkages instantly if available.
   * Graceful degradation: returns null if not ready, letting normal UI flow handle loading.
   */
  public getPredictedLinkages(caseId: string): Linkage[] | null {
    const entry = this.cache.get(caseId);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.linkages;
    }
    return null;
  }
}

export const oracle = new OracleEngine();
