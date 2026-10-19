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
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await sleep(100 * Math.pow(2, attempt - 1));
    }
  }
  throw new Error("Unreachable");
}

class OracleEngine {
  private cache = new Map<string, { linkages: Linkage[], expiresAt: number }>();
  private inflight = new Set<string>();

  // Circuit Breaker State
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private readonly MAX_FAILURES = 5;
  private readonly CIRCUIT_COOLDOWN_MS = 60000; // 1 minute

  // In a real app, this would be an API call to a similarity engine.
  // We simulate it here as a heavy background job.
  private async computeLinkages(caseId: string): Promise<Linkage[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional failure
        if (Math.random() < 0.1) {
          reject(new Error("Simulated transient network failure"));
        } else {
          resolve([]); // Simulated results
        }
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

    // Circuit Breaker Check
    if (this.circuitOpenUntil > Date.now()) {
      console.warn("Oracle Circuit Breaker OPEN. Skipping background prediction for case:", caseId);
      return;
    } else if (this.circuitOpenUntil > 0) {
      // Half-open: cooldown expired, let one try through and reset state.
      // Resetting here means if this one fails, it counts as 1 towards MAX_FAILURES again.
      // For a stricter half-open, you'd keep failureCount at MAX_FAILURES until a success.
      // For simplicity, we reset entirely.
      this.failureCount = 0;
      this.circuitOpenUntil = 0;
    }

    this.inflight.add(caseId);

    // Background job with retry and circuit breaker logic
    withRetry(() => this.computeLinkages(caseId), 3)
      .then(linkages => {
        // Success: reset circuit breaker
        this.failureCount = 0;
        // Cache for 5 minutes
        this.cache.set(caseId, { linkages, expiresAt: Date.now() + 5 * 60 * 1000 });
      })
      .catch(err => {
        this.failureCount++;
        console.error(`Oracle background prediction failed (Attempt ${this.failureCount}/${this.MAX_FAILURES}):`, err);

        if (this.failureCount >= this.MAX_FAILURES) {
          this.circuitOpenUntil = Date.now() + this.CIRCUIT_COOLDOWN_MS;
          console.error(`Oracle Circuit Breaker TRIPPED. Open for ${this.CIRCUIT_COOLDOWN_MS / 1000}s.`);
        }
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
