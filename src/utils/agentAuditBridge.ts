import { eventBus } from './events';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

let currentAuditLogs: AuditTrail[] = [];

export function setAuditLogsContext(logs: AuditTrail[]) {
  currentAuditLogs = logs;
}

export function getAuditLogsContext(): AuditTrail[] {
  return currentAuditLogs;
}

export function initializeAgentAuditBridge() {
  eventBus.on('agent.log', (log: AgentLog) => {
    // Only capture significant events, like actions or success/warnings
    if (log.type === 'action' || log.type === 'success' || log.type === 'warn') {
      const actionType = `AGENT_${log.agent.toUpperCase()}_${log.type.toUpperCase()}`;

      currentAuditLogs = createAuditLog(
        currentAuditLogs,
        actionType,
        log.message,
        `System Agent: ${log.agent}`
      );
    }
  });
}
