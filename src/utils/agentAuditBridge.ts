import React from 'react';
import { eventBus } from './eventBus';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

export function setupAgentAuditBridge(setLogs: React.Dispatch<React.SetStateAction<AuditTrail[]>>) {
  const unsubscribe = eventBus.on('agent.action', (log: AgentLog) => {
    // Only log significant agent actions to the audit ledger
    if (log.type === 'action' || log.type === 'warn' || log.type === 'success') {
      setLogs(prevLogs => {
        return createAuditLog(
          prevLogs,
          `AGENT_${log.type.toUpperCase()}`,
          `[${log.agent}] ${log.message}`,
          "System Agent"
        );
      });
    }
  });

  return unsubscribe;
}
