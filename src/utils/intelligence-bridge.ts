import { AgentLog, AuditTrail } from '../types.js';
import { createAuditLog } from './audit.js';

/**
 * Synapse Connection: Agent System ↔ Audit System
 *
 * Intercepts critical AI agent events (warnings and actions) and enriches
 * the immutable Audit Trail with these events to ensure AI operations
 * are cryptographically secured in the legal record.
 */
export function bridgeAgentToAudit(
  logs: AuditTrail[],
  agentLog: AgentLog
): AuditTrail[] {
  // Only bridge high-priority logs (ignore general info and success messages)
  if (agentLog.type !== 'warn' && agentLog.type !== 'action') {
    return logs;
  }

  const action = `AI_AGENT_${agentLog.type.toUpperCase()}`;
  const details = `[${agentLog.agent}] ${agentLog.message}`;
  const author = `System Context (${agentLog.agent})`;

  return createAuditLog(logs, action, details, author);
}
