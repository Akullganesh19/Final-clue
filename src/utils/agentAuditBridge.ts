import { eventBus } from './events.js';
import { createAuditLog } from './audit.js';
import { AgentLog, AuditTrail } from '../types.js';

// In a real system, these would likely be fetched from a DB or global state.
// For the bridge, we'll maintain an in-memory array to demonstrate the append.
let globalAuditLogs: AuditTrail[] = [];

export function setupAgentAuditBridge() {
  eventBus.on('agent.action', (agentLog: AgentLog) => {
    if (agentLog.type === 'action') {
      console.log(`Bridge fired for agent: ${agentLog.agent}`);
      const details = `Agent ${agentLog.agent} performed action: ${agentLog.message}`;
      globalAuditLogs = createAuditLog(
        globalAuditLogs,
        'AGENT_ACTION',
        details,
        `System (${agentLog.agent})`
      );
    }
  });
}

// Export for testing
export function getGlobalAuditLogs() {
  return globalAuditLogs;
}

export function resetGlobalAuditLogs() {
  globalAuditLogs = [];
}
