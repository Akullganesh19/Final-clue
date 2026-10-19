import { eventBus } from './events.ts';
import { createAuditLog } from './audit.ts';
import { AgentLog, AuditTrail } from '../types.ts';

export function setupAgentAuditBridge(
  getLogs: () => AuditTrail[],
  onUpdate: (logs: AuditTrail[]) => void
) {
  eventBus.on<AgentLog>('agent.log', (log) => {
    // Only audit important agent actions
    if (log.type === 'action' || log.type === 'success') {
      const currentLogs = getLogs();
      const newLogs = createAuditLog(
        currentLogs,
        `Agent ${log.agent} Action`,
        log.message,
        `Agent (${log.agent})`
      );

      onUpdate(newLogs);
    }
  });
}
