import { AuditTrail } from '../types';

/**
 * ActionPredictor (Oracle Engine)
 * Learns the sequence of user actions using a simple Markov chain.
 * By observing the AuditTrail, it records transitions (Action A -> Action B).
 * When Action A occurs, it predicts the most likely next action and proactively
 * prefetches the required data for that action.
 */
class ActionPredictor {
  // transitionCounts[actionA][actionB] = count
  private transitionCounts: Record<string, Record<string, number>> = {};
  private lastAction: string | null = null;
  private actionToEndpointMap: Record<string, string> = {
    'VIEW_CASE': '/api/cases',
    'VIEW_LINKAGE': '/api/linkages',
    'SEARCH_EVIDENCE': '/api/evidence',
    'VIEW_ANALYTICS': '/api/analytics'
  };

  /**
   * Observe a new action, update transition counts, and prefetch based on predictions.
   */
  public observe(log: AuditTrail): void {
    const currentAction = log.action;

    // 1. Learn the transition
    if (this.lastAction) {
      if (!this.transitionCounts[this.lastAction]) {
        this.transitionCounts[this.lastAction] = {};
      }
      this.transitionCounts[this.lastAction][currentAction] =
        (this.transitionCounts[this.lastAction][currentAction] || 0) + 1;
    }

    this.lastAction = currentAction;

    // 2. Predict next action
    const likelyNextAction = this.predictNextAction(currentAction);

    // 3. Prefetch data for predicted action
    if (likelyNextAction) {
      this.prefetchData(likelyNextAction);
    }
  }

  private predictNextAction(currentAction: string): string | null {
    const transitions = this.transitionCounts[currentAction];
    if (!transitions) return null;

    let bestAction: string | null = null;
    let maxCount = 0;

    for (const [nextAction, count] of Object.entries(transitions)) {
      if (count > maxCount) {
        maxCount = count;
        bestAction = nextAction;
      }
    }
    return bestAction;
  }

  private prefetchData(predictedAction: string): void {
    const endpoint = this.actionToEndpointMap[predictedAction];
    if (!endpoint) return;

    // Avoid running in Node SSR environments unless absolute URLs are used
    if (typeof window === 'undefined') return;

    try {
      // Use low priority to not block main thread/requests, include credentials for auth
      fetch(endpoint, {
        priority: 'low',
        credentials: 'include'
      } as any).catch(err => {
        // Degrade gracefully - errors are ignored, normal flow will just fetch again later
        console.warn(`Oracle prefetch failed for ${endpoint}:`, err);
      });
    } catch (err) {
      // Handle synchronous errors (like malformed URLs) gracefully
    }
  }
}

export const actionPredictor = new ActionPredictor();
