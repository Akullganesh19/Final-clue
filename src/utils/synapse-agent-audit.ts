import { AgentLog, AuditTrail } from '../types.js';
import { createAuditLog } from './audit.js';

/**
 * Bridges AgentLogs to the AuditTrail system.
 * Only action-oriented agent logs are persisted to the secure audit trail.
 */
export function bridgeAgentLogToAudit(
  log: AgentLog,
  currentTrail: AuditTrail[]
): AuditTrail[] {
  if (log.type === 'action') {
    console.log(`[Synapse] Connection fired (A->B): Bridging AgentLog ${log.id} to AuditTrail`);
    const newTrail = createAuditLog(
      currentTrail,
      `AGENT_ACTION: ${log.agent}`,
      log.message,
      `AI: ${log.agent}`
    );
    console.log(`[Synapse] Connection fired (B<-A): AuditTrail updated with hash ${newTrail[newTrail.length - 1].hash}`);
    return newTrail;
  }
  return currentTrail;
}
