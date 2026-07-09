import { eventBus } from './events.js';
import { createAuditLog } from './audit.js';
import { AgentLog, AuditTrail } from '../types.js';

// We maintain a local copy of logs for the bridge,
// or typically this would update a central store.
export let auditLogs: AuditTrail[] = [];

export function setupAgentAuditBridge() {
  eventBus.on('agent.action', (agentLog: AgentLog) => {
    // When an agent performs an action, bridge it to the audit trail
    // It creates an intelligence connection between the Agent System and the Audit System
    const action = `AGENT_ACTION_${agentLog.agent.toUpperCase()}`;
    const details = agentLog.message;
    const author = `System Agent: ${agentLog.agent}`;

    auditLogs = createAuditLog(auditLogs, action, details, author);
  });
}

// Ensure the bridge is set up when imported
setupAgentAuditBridge();

export function clearAuditLogs() {
    auditLogs = [];
}