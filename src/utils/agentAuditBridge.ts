import { eventBus } from './eventBus';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

export function setupAgentAuditBridge(updateLogs: (updater: (logs: AuditTrail[]) => AuditTrail[]) => void) {
  const handleAgentAction = (log: AgentLog) => {
    console.log(`[Bridge Fire] Routing agent action from ${log.agent} to Audit Ledger.`);

    updateLogs((currentLogs) => {
      // Create new audit log with Agent log context
      return createAuditLog(
        currentLogs,
        `AGENT_ACTION_${log.agent.toUpperCase()}`,
        log.message,
        `System Agent: ${log.agent}`
      );
    });

    console.log(`[Bridge Fire] Successfully routed agent action to Audit Ledger.`);
  };

  eventBus.on('agent.action', handleAgentAction);

  return () => {
    eventBus.off('agent.action', handleAgentAction);
  };
}
