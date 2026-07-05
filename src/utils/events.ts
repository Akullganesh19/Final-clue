import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

type EventCallback = (...args: any[]) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

export const eventBus = new EventBus();

// Synapse connection: bridge AgentLogs into the AuditTrail system
export function bridgeAgentToAudit(
  updateAuditLogs: (updater: (logs: AuditTrail[]) => AuditTrail[]) => void
) {
  eventBus.on('agent.log', (log: AgentLog) => {
    // Only cryptographically record "action" and "success" types to avoid noise
    if (log.type === 'action' || log.type === 'success') {
      updateAuditLogs((prevLogs) =>
        createAuditLog(
          prevLogs,
          `AGENT_${log.agent.toUpperCase()}_ACTION`,
          log.message,
          `Agent: ${log.agent}`
        )
      );
    }
  });
}
