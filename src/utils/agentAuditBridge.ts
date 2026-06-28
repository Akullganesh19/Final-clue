import { eventBus } from './eventBus';
import { createAuditLog } from './audit';
import { AuditTrail, AgentLog } from '../types';
import React from 'react';

/**
 * Connects the ephemeral Agent Logs system with the immutable Audit Ledger.
 * When an agent performs an action, this bridge catches the 'agent.action' event
 * and cryptographically secures it in the AuditTrail using the React state updater
 * without requiring the Agent system to know about the Audit system.
 */
export function setupAgentAuditBridge(setAuditLogs: React.Dispatch<React.SetStateAction<AuditTrail[]>>) {
  // Listen for agent actions emitted anywhere in the app
  const unsubscribe = eventBus.on<AgentLog>('agent.action', (agentLog) => {
    // Only audit actual actions or successes, skip simple info logs
    if (agentLog.type === 'action' || agentLog.type === 'success') {
      const action = `[AGENT:${agentLog.agent.toUpperCase()}]`;
      const details = agentLog.message;
      const author = `System Agent: ${agentLog.agent}`;

      // Asynchronously update the audit trail using the state updater callback form.
      // This ensures we always have the latest logs state without closing over stale state.
      setAuditLogs((prevLogs) => {
        return createAuditLog(prevLogs, action, details, author);
      });
    }
  });

  return unsubscribe;
}
