import { eventBus } from './events';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

/**
 * Synapse: Agent Logs -> Audit Trail
 * Intelligence Emerged: Agent actions are automatically immutable and verifiable.
 * Instead of relying on engineers to manually call `createAuditLog` whenever an
 * agent takes an action, this neural pathway bridges the two systems seamlessly.
 */

// Global state for audit trail to mimic real-world persistence
let globalAuditTrail: AuditTrail[] = [];

export function initializeSynapseConnections() {
  eventBus.on('agent.logged', (logEntry: AgentLog) => {
    // We only want to create audit trails for significant agent "actions"
    if (logEntry.type === 'action') {
      const actionTitle = `${logEntry.agent} Action`;
      const details = logEntry.message;
      const author = `System Agent: ${logEntry.agent}`;

      globalAuditTrail = createAuditLog(
        globalAuditTrail,
        actionTitle,
        details,
        author
      );

      console.log(`[Synapse 🧠] Neural pathway fired: Agent action transformed to immutable audit trail.`);
    }
  });
}

export function getSynapseAuditTrail(): AuditTrail[] {
  return [...globalAuditTrail];
}

// Reset for testing purposes
export function resetSynapseAuditTrail() {
  globalAuditTrail = [];
}
