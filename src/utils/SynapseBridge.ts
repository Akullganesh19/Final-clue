import { EventBus } from './EventBus';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

let currentAuditLogs: AuditTrail[] = [];

export function initSynapseBridge(initialLogs: AuditTrail[] = []): void {
  currentAuditLogs = [...initialLogs];

  console.log('[SynapseBridge] Initializing bridge between Agent System and Audit Ledger.');

  EventBus.on('agent.action', (agentLog: AgentLog) => {
    if (agentLog.type !== 'action' && agentLog.type !== 'success') {
      return; // We only want to audit significant actions/successes
    }

    console.log(`[SynapseBridge] Neural pathway fired: Agent System → Audit Ledger for ${agentLog.agent}`);

    const idempotencyKey = `synapse-agent-log-${agentLog.id}`;
    const action = `AGENT_${agentLog.agent.toUpperCase()}_ACTION`;
    const details = agentLog.message;
    const author = `Agent: ${agentLog.agent}`;

    currentAuditLogs = createAuditLog(
      currentAuditLogs,
      idempotencyKey,
      action,
      details,
      author
    );
  });
}

export function getBridgedAuditLogs(): AuditTrail[] {
  return [...currentAuditLogs];
}
