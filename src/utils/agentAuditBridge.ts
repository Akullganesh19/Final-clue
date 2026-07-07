import { eventBus } from './events.js';
import { AgentLog, AuditTrail } from '../types.js';
import { createAuditLog } from './audit.js';

// The in-memory audit trail, since the system doesn't have a DB yet.
// In a real app this would likely be fetched or appended to a backend endpoint.
let globalAuditTrail: AuditTrail[] = [];

export function setupAgentAuditBridge() {
  eventBus.on('agent.log', (log: AgentLog) => {
    // We only want to formally audit actual actions, not just info or warnings
    if (log.type === 'action') {
      const details = `Agent: ${log.agent} - ${log.message}`;
      globalAuditTrail = createAuditLog(
        globalAuditTrail,
        'AGENT_ACTION',
        details,
        `System Agent (${log.agent})`
      );

      // Emit an event that the audit trail was updated, just in case anyone else cares
      eventBus.emit('audit.updated', globalAuditTrail[globalAuditTrail.length - 1]);
    }
  });
}

// For testing purposes
export function getGlobalAuditTrail() {
  return globalAuditTrail;
}

export function resetGlobalAuditTrail() {
  globalAuditTrail = [];
}
