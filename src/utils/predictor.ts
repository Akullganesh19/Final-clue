export class NextActionPredictor {
  private lastAction: string | null = null;
  private transitions: Record<string, Record<string, number>> = {};
  public currentPrediction: string | null = null;

  // Trains the Markov chain by observing the transition from the last action to the current one
  train(action: string) {
    if (this.lastAction !== null) {
      if (!this.transitions[this.lastAction]) {
        this.transitions[this.lastAction] = {};
      }
      this.transitions[this.lastAction][action] = (this.transitions[this.lastAction][action] || 0) + 1;
    }
    this.lastAction = action;
    this.predict(action);
  }

  // Predicts the most likely next action based on historical transition frequencies from the current action
  predict(currentAction: string): string | null {
    const nextActions = this.transitions[currentAction];
    if (!nextActions) {
      this.currentPrediction = null;
      return null;
    }

    let mostLikely = null;
    let maxCount = 0;
    for (const [nextAction, count] of Object.entries(nextActions)) {
      if (count > maxCount) {
        maxCount = count;
        mostLikely = nextAction;
      }
    }
    this.currentPrediction = mostLikely;

    if (mostLikely) {
      console.log(`[Oracle] Next action predicted: ${mostLikely} (based on ${maxCount} past observations)`);
    }

    return mostLikely;
  }
}

export const actionPredictor = new NextActionPredictor();
