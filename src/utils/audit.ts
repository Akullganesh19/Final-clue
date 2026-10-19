import { AuditTrail } from '../types';

class ActionPredictor {
  private markovChain = new Map<string, Map<string, number>>();

  private actionEndpoints: Record<string, string> = {
    'VIEW_CASE': '/api/cases',
    'LINK_CASE': '/api/linkages',
    'SEARCH_EVIDENCE': '/api/evidence',
    'VIEW_MATRIX': '/api/matrix',
    'ADD_NOTE': '/api/notes',
    'VIEW_GRAPH': '/api/graph',
    'LOGIN': '/api/user',
    'LOGOUT': '/api/logout'
  };

  train(logs: AuditTrail[]) {
    // Clear state before training to avoid quadratic counting
    this.markovChain.clear();
    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.markovChain.has(currentAction)) {
        this.markovChain.set(currentAction, new Map<string, number>());
      }

      const transitions = this.markovChain.get(currentAction)!;
      transitions.set(nextAction, (transitions.get(nextAction) || 0) + 1);
    }
  }

  predictNext(currentAction: string): string | null {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let mostLikelyAction: string | null = null;
    let maxCount = -1;

    transitions.forEach((count, action) => {
      if (count > maxCount) {
        maxCount = count;
        mostLikelyAction = action;
      }
    });

    return mostLikelyAction;
  }

  prefetch(action: string) {
    if (typeof window === 'undefined') return;

    const nextAction = this.predictNext(action);
    if (!nextAction) return;

    const endpoint = this.actionEndpoints[nextAction];
    if (!endpoint) return;

    try {
      fetch(endpoint, {
        priority: 'low',
        credentials: 'include'
      } as any).catch(() => {});
    } catch (e) {
      // Graceful degradation
    }
  }
}

export const actionPredictor = new ActionPredictor();

export function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'CHK-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  const newLogs = [...logs, newLog];

  // Asynchronously train the predictor and prefetch
  const timer = setTimeout(() => {
    actionPredictor.train(newLogs);
    actionPredictor.prefetch(action);
  }, 0);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  return newLogs;
}