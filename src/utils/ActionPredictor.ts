export class ActionPredictor {
  private transitionMatrix: Record<string, Record<string, number>> = {};
  private lastAction: string | null = null;

  /**
   * Tracks a user action, updating the Markov chain transition matrix
   * and attempting to prefetch resources for the next likely action.
   */
  public trackAction(action: string): void {
    if (this.lastAction) {
      if (!this.transitionMatrix[this.lastAction]) {
        this.transitionMatrix[this.lastAction] = {};
      }
      if (!this.transitionMatrix[this.lastAction][action]) {
        this.transitionMatrix[this.lastAction][action] = 0;
      }
      this.transitionMatrix[this.lastAction][action]++;
    }

    this.lastAction = action;

    const nextLikelyAction = this.predictNextAction(action);
    if (nextLikelyAction) {
      this.prefetchForAction(nextLikelyAction);
    }
  }

  /**
   * Predicts the most likely next action based on the transition matrix.
   */
  public predictNextAction(currentAction: string): string | null {
    const transitions = this.transitionMatrix[currentAction];
    if (!transitions) return null;

    let maxCount = 0;
    let mostLikelyNextAction: string | null = null;

    for (const [nextAction, count] of Object.entries(transitions)) {
      if (count > maxCount) {
        maxCount = count;
        mostLikelyNextAction = nextAction;
      }
    }

    return mostLikelyNextAction;
  }

  /**
   * Simulates prefetching data or resources for an anticipated action.
   */
  private prefetchForAction(action: string): void {
    console.log(`🛸 Oracle prefetching resources for: ${action}`);
  }

  // Expose transition matrix for testing purposes
  public getTransitionMatrix(): Record<string, Record<string, number>> {
    return this.transitionMatrix;
  }

  public reset(): void {
    this.transitionMatrix = {};
    this.lastAction = null;
  }
}

// Export as singleton
export const actionPredictor = new ActionPredictor();
