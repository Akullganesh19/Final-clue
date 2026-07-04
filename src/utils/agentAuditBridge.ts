import { eventBus } from './events';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

export function initializeAgentAuditBridge(getInitialLogs: () => AuditTrail[]): void {
  let currentLogs = getInitialLogs();

  eventBus.on('agent.log', (agentLog: AgentLog) => {
    // Only audit logs that represent significant actions or issues
    if (['action', 'warn', 'success'].includes(agentLog.type)) {
      currentLogs = createAuditLog(
        currentLogs,
        `AGENT_${agentLog.type.toUpperCase()}`,
        `${agentLog.agent}: ${agentLog.message}`,
        `Agent System (${agentLog.agent})`
      );

      // Emit the updated audit log so downstream systems can react if necessary
      eventBus.emit('audit.updated', currentLogs);
    }
  });
}
