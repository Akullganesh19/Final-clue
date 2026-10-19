import { eventBus } from './events';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

let currentAuditTrail: AuditTrail[] = [];

export function getAuditTrail(): AuditTrail[] {
  return currentAuditTrail;
}

export function resetAuditTrailForTest(): void {
  currentAuditTrail = [];
}

export function setupAgentAuditBridge() {
  eventBus.on('agent.action', (agentLog: AgentLog) => {
    console.log(`[Synapse] Agent -> Audit: Firing connection for agent log ${agentLog.id}`);

    currentAuditTrail = createAuditLog(
      currentAuditTrail,
      `AGENT_ACTION_${agentLog.agent.toUpperCase()}`,
      agentLog.message,
      `System Agent (${agentLog.agent})`,
      agentLog.id
    );

    console.log(`[Synapse] Audit -> Agent: Connection fired successfully for agent log ${agentLog.id}`);
  });
}
