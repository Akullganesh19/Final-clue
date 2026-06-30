import { eventBus } from './eventBus';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

/**
 * Bridges Agent System to Audit Ledger
 *
 * Listens for agent actions and automatically creates immutable
 * audit trail entries.
 */
export function setupAuditBridge(
  setLogs: (updater: (prevLogs: AuditTrail[]) => AuditTrail[]) => void
) {
  const handleAgentAction = (agentLog: AgentLog) => {
    // Only audit "action" types, ignore info/success/warn
    if (agentLog.type !== 'action') return;

    setLogs((prevLogs: AuditTrail[]) => {
      return createAuditLog(
        prevLogs,
        `Agent Action: ${agentLog.agent}`,
        agentLog.message,
        `System: ${agentLog.agent} Agent`
      );
    });
  };

  eventBus.on('agent.action', handleAgentAction);

  return () => {
    eventBus.off('agent.action', handleAgentAction);
  };
}
