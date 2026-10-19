import { eventBus } from './eventBus';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

export function setupAgentAuditBridge(
  setAuditLogs: (updater: (logs: AuditTrail[]) => AuditTrail[]) => void
) {
  const handler = (log: AgentLog) => {
    if (log.type === 'action') {
      setAuditLogs(currentLogs =>
        createAuditLog(
          currentLogs,
          `AGENT_ACTION_${log.agent.toUpperCase()}`,
          log.message,
          `Agent: ${log.agent}`
        )
      );
    }
  };

  eventBus.on('agent.log', handler);

  return () => {
    eventBus.off('agent.log', handler);
  };
}
