import { AuditTrail } from '../types';

export class ActionPredictor {
  // Markov chain: mapping an action to the count of subsequent actions
  private markovChain: Map<string, Map<string, number>> = new Map();
  // Cache to prevent duplicate prefetches within a short TTL
  private prefetchCache: Map<string, number> = new Map();

  /**
   * Trains the Markov chain from a sequence of audit logs.
   * Clears internal state before training to prevent quadratic counting of historical transitions.
   */
  public train(logs: AuditTrail[]): void {
    this.markovChain.clear();

    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.markovChain.has(currentAction)) {
        this.markovChain.set(currentAction, new Map());
      }

      const transitions = this.markovChain.get(currentAction)!;
      transitions.set(nextAction, (transitions.get(nextAction) || 0) + 1);
    }
  }

  /**
   * Predicts the most likely next action given a current action.
   */
  public predictNext(currentAction: string): string | null {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let bestAction: string | null = null;
    let maxCount = -1;

    transitions.forEach((count, action) => {
      if (count > maxCount) {
        maxCount = count;
        bestAction = action;
      }
    });

    return bestAction;
  }

  /**
   * Maps actions to real API endpoints to ensure we build real prefetches, not stubs.
   */
  private getEndpointForAction(action: string): string | null {
    const actionMap: Record<string, string> = {
      'VIEW_CASE': '/api/cases',
      'VIEW_EVIDENCE': '/api/evidence',
      'VIEW_LINKAGE': '/api/linkages',
      'SEARCH': '/api/search',
    };
    return actionMap[action] || null;
  }

  /**
   * Predicts the next action and proactively prefetches its required data.
   */
  public prefetchNext(currentAction: string): void {
    if (typeof window === 'undefined') {
      // Avoid Node.js crashes in SSR environments
      return;
    }

    const predictedAction = this.predictNext(currentAction);
    if (!predictedAction) return;

    const endpoint = this.getEndpointForAction(predictedAction);
    if (!endpoint) return;

    // 10 second TTL for prefetches
    if (this.prefetchCache.has(endpoint)) {
      return;
    }

    this.prefetchCache.set(endpoint, 1);
    const timer = setTimeout(() => {
      this.prefetchCache.delete(endpoint);
    }, 10000);
    if (typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }

    try {
      // Safely prefetch with low priority and credentials included
      const fetchPromise = fetch(endpoint, {
        priority: 'low',
        credentials: 'include',
      } as RequestInit);

      // Gracefully handle async errors so they don't leak
      fetchPromise.catch((err) => {
        console.warn(`Prefetch failed for ${endpoint}:`, err);
      });
    } catch (err) {
      console.warn(`Synchronous prefetch error for ${endpoint}:`, err);
    }
  }
}

// Export a global singleton to be used across the application
export const globalPredictor = new ActionPredictor();
