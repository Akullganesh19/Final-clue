export class NextActionPredictor {
  private lastAction: string | null = null;
  private transitionMatrix: Record<string, Record<string, number>> = {};

  train(action: string) {
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
  }

  predict(action: string): string | null {
    const transitions = this.transitionMatrix[action];
    if (!transitions) return null;

    let bestAction: string | null = null;
    let maxCount = -1;

    for (const [nextAction, count] of Object.entries(transitions)) {
      if (count > maxCount) {
        maxCount = count;
        bestAction = nextAction;
      }
    }

    return bestAction;
  }
}

export const globalPredictor = new NextActionPredictor();
