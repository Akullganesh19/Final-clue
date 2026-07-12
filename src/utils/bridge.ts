import { eventBus } from './events';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

// Central in-memory ledger for demonstration purposes
export let globalAuditLogs: AuditTrail[] = [];

export function setupAgentAuditBridge() {
  eventBus.on('agent.action', (agentLog: AgentLog) => {
    // Log incoming from System A (Agent System)
    console.log(`[Synapse Bridge] 📥 Received 'agent.action' from ${agentLog.agent} Agent: ${agentLog.message}`);

    const actionName = `${agentLog.agent} Agent Activity`;
    const details = agentLog.message;
    const author = `System Agent: ${agentLog.agent}`;

    globalAuditLogs = createAuditLog(globalAuditLogs, actionName, details, author);

    // Log outgoing to System B (Audit System)
    console.log(`[Synapse Bridge] 📤 Emitted new audit log to Audit Ledger. Total logs: ${globalAuditLogs.length}`);
  });
}

// For testing purposes
export function _resetGlobalAuditLogs() {
    globalAuditLogs = [];
}