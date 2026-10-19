import { AuditTrail } from '../types.js';

export class ActionPredictor {
  // Markov chain tracking action transitions: Map<currentAction, Map<nextAction, count>>
  private transitions: Record<string, Record<string, number>> = {};
  private lastAction: string | null = null;

  // Maps actions to valid read-only endpoints to ensure we only prefetch real data
  private endpointMap: Record<string, string> = {
    'VIEW_CASE': '/api/cases',
    'SEARCH_EVIDENCE': '/api/evidence',
    'LINK_CASES': '/api/linkages',
    'VIEW_AUDIT': '/api/audit'
  };

  /**
   * Observes a new action, updating the Markov chain and triggering a prefetch
   * for the next most likely action.
   */
  observeAction(action: string) {
    // 1. Learn from the transition
    if (this.lastAction) {
      if (!this.transitions[this.lastAction]) {
        this.transitions[this.lastAction] = {};
      }
      const counts = this.transitions[this.lastAction];
      counts[action] = (counts[action] || 0) + 1;
    }
    this.lastAction = action;

    // 2. Predict and prefetch next action
    this.prefetchLikelyNext(action);
  }

  /**
   * Pre-loads the model with historical audit logs.
   */
  learnFromHistory(logs: AuditTrail[]) {
    logs.forEach(log => this.observeAction(log.action));
  }

  predictNext(currentAction: string): string | null {
    const nextActions = this.transitions[currentAction];
    if (!nextActions) return null;

    let bestAction: string | null = null;
    let maxCount = 0;

    for (const [action, count] of Object.entries(nextActions)) {
      if (count > maxCount) {
        bestAction = action;
        maxCount = count;
      }
    }

    return bestAction;
  }

  private prefetchLikelyNext(currentAction: string): void {
    const nextAction = this.predictNext(currentAction);
    if (!nextAction) return;

    const endpoint = this.endpointMap[nextAction];
    if (!endpoint) return;

    // Ensure we are in a browser context before prefetching to avoid SSR crashes
    if (typeof window !== 'undefined' && typeof globalThis.fetch === 'function') {
      try {
        // Respect auth boundaries with credentials: 'include', and don't block main thread
        globalThis.fetch(endpoint, {
          priority: 'low',
          credentials: 'include'
        } as RequestInit).catch(() => {
          // Gracefully degrade: ignore prefetch failures, normal flow handles real requests
        });
      } catch (err) {
        // Handle synchronous fetch initialization errors silently
      }
    }
  }

  // For testing purposes
  getTransitions() {
    return this.transitions;
  }

  reset() {
    this.transitions = {};
    this.lastAction = null;
  }
}

export const actionPredictor = new ActionPredictor();
