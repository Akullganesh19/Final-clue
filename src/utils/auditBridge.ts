import { eventBus } from './eventBus';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

export function setupAuditBridge(setLogs: (updater: (prevLogs: AuditTrail[]) => AuditTrail[]) => void) {
  // Listen for agent actions and bridge them to the audit ledger
  const unsubscribe = eventBus.on('agent.action', (agentLog: AgentLog) => {
    // We only want to log actual actions, not just info or successes
    // (though depending on requirements, we could log everything).
    // For now, let's log everything that comes through this event as it represents an 'action' event.

    setLogs((prevLogs: AuditTrail[]) => {
      return createAuditLog(
        prevLogs,
        `Agent Action: ${agentLog.agent}`,
        agentLog.message,
        `System: ${agentLog.agent} Agent`
      );
    });
  });

  return unsubscribe;
}
