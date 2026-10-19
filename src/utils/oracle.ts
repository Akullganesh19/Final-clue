import { AuditTrail } from '../types';

export interface ActionPrediction {
  action: string;
  probability: number;
}

export class ActionPredictor {
  private transitionCounts: Map<string, Map<string, number>> = new Map();
  private stateCounts: Map<string, number> = new Map();

  /**
   * Analyzes an audit trail to build a Markov chain model of user actions.
   * Calculates frequencies of action sequences to predict next steps.
   */
  public analyzeHistory(history: AuditTrail[]): void {
    // Reset state to avoid exponential accumulation when called repeatedly with growing history
    this.transitionCounts.clear();
    this.stateCounts.clear();

    for (let i = 0; i < history.length - 1; i++) {
      const currentAction = history[i].action;
      const nextAction = history[i + 1].action;

      // Update state count
      this.stateCounts.set(currentAction, (this.stateCounts.get(currentAction) || 0) + 1);

      // Update transition count
      if (!this.transitionCounts.has(currentAction)) {
        this.transitionCounts.set(currentAction, new Map());
      }
      const transitionsFromCurrent = this.transitionCounts.get(currentAction)!;
      transitionsFromCurrent.set(nextAction, (transitionsFromCurrent.get(nextAction) || 0) + 1);
    }

    // Also record the last action without a next action to ensure it's in the state count
    if (history.length > 0) {
      const lastAction = history[history.length - 1].action;
      this.stateCounts.set(lastAction, (this.stateCounts.get(lastAction) || 0) + 1);
    }
  }

  /**
   * Predicts the most likely next actions based on the current action.
   * Respects user permissions (authorization boundaries) by filtering out actions they cannot perform.
   */
  public predictNextActions(currentAction: string, userPermissions: string[], limit: number = 3): ActionPrediction[] {
    const transitions = this.transitionCounts.get(currentAction);
    const totalTransitions = this.stateCounts.get(currentAction);

    // Graceful degradation: If we haven't seen this state before or it has no outgoing transitions, return an empty array
    if (!transitions || !totalTransitions) {
      return [];
    }

    const predictions: ActionPrediction[] = [];
    for (const [nextAction, count] of transitions.entries()) {
      if (userPermissions.includes(nextAction)) {
        predictions.push({
          action: nextAction,
          probability: count / totalTransitions
        });
      }
    }

    // Sort by probability descending
    predictions.sort((a, b) => b.probability - a.probability);

    return predictions.slice(0, limit);
  }

  /**
   * Prefetches resources for the predicted actions to improve perceived latency.
   */
  public prefetch(predictions: ActionPrediction[]): void {
    if (predictions.length === 0) return;

    const topAction = predictions[0].action;

    // Map actions to their corresponding prefetchable API endpoints
    const actionToEndpoint: Record<string, string> = {
      'VIEW_CASE': '/api/cases',
      'VIEW_EVIDENCE': '/api/evidence',
      'LINK_CASE': '/api/links',
      'VIEW_NETWORK': '/api/network',
    };

    const url = actionToEndpoint[topAction];
    if (url) {
      // Execute a real prefetch to warm up the cache
      // The browser/client will handle the caching based on headers
      try {
        // Only run fetch in browser context or if URL is absolute, avoiding Node.js fetch relative URL crash
        if (typeof window !== 'undefined' || url.startsWith('http')) {
          fetch(url, { headers: { 'X-Prefetch': 'true' } }).catch(() => {
            // Silently ignore prefetch network errors to gracefully degrade
          });
        }
      } catch (e) {
        // Catch synchronous throws from fetch implementation
      }
    }
  }
}
