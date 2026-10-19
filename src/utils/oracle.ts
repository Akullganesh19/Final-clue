import { AuditTrail } from '../types';

export interface ActionPrediction {
  nextAction: string | null;
  confidence: number;
}

/**
 * Predicts the user's next action based on their historical audit trail.
 * Uses a simple Markov chain approach to find the most frequent action
 * that immediately follows the user's current action.
 *
 * @param logs The complete system audit trail
 * @param currentAction The action the user just performed
 * @param author The user for whom we are making the prediction
 * @returns An ActionPrediction with the most likely next action and confidence, or null if insufficient data
 */
export function predictNextAction(
  logs: AuditTrail[],
  currentAction: string,
  author: string
): ActionPrediction {
  // Filter logs to only include actions by the specified author
  // This inherently respects permissions, as we only recommend actions
  // the user has historically been able to perform.
  const authorLogs = logs.filter((log) => log.author === author);

  // We need at least 2 logs to form a transition pair
  if (authorLogs.length < 2) {
    return { nextAction: null, confidence: 0 };
  }

  // Map to store transition frequencies: { 'NextAction': count }
  const transitions: Record<string, number> = {};
  let totalTransitions = 0;

  // Scan through the author's history to find what they usually do after `currentAction`
  for (let i = 0; i < authorLogs.length - 1; i++) {
    if (authorLogs[i].action === currentAction) {
      const nextAction = authorLogs[i + 1].action;
      transitions[nextAction] = (transitions[nextAction] || 0) + 1;
      totalTransitions++;
    }
  }

  // Graceful degradation: If they've never done this action before (or it's always been their last action)
  if (totalTransitions === 0) {
    return { nextAction: null, confidence: 0 };
  }

  // Find the action with the highest frequency
  let mostLikelyAction: string | null = null;
  let maxCount = 0;

  for (const [action, count] of Object.entries(transitions)) {
    if (count > maxCount) {
      maxCount = count;
      mostLikelyAction = action;
    }
  }

  // Calculate confidence as the frequency of the most likely action divided by total transitions from currentAction
  const confidence = maxCount / totalTransitions;

  // We want to be reasonably confident before prefetching or suggesting
  // If confidence is too low, we don't predict anything
  if (confidence < 0.3) { // 30% threshold for "useful" prediction
    return { nextAction: null, confidence };
  }

  return {
    nextAction: mostLikelyAction,
    confidence
  };
}
