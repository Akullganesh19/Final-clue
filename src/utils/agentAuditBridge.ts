import { eventBus } from './events';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

export function setupAgentAuditBridge(getLogs: () => AuditTrail[], setLogs: (logs: AuditTrail[]) => void) {
  eventBus.on('agent.log', (log: AgentLog) => {
    // Only audit concrete actions, not general info/success/warn logs
    if (log.type === 'action') {
      console.log(`[Synapse] Bridging AgentLog action to AuditTrail: ${log.agent} - ${log.message}`);
      const currentLogs = getLogs();
      const newLogs = createAuditLog(
        currentLogs,
        `Agent Action: ${log.agent}`,
        log.message,
        `System: ${log.agent}`
      );
      setLogs(newLogs);
    }
  });
}
