import { eventBus } from './eventBus.js';
import { createAuditLog } from './audit.js';
import { AgentLog, AuditTrail } from '../types.js';

export function initAgentAuditBridge(
  getAuditTrail: () => AuditTrail[],
  setAuditTrail: (trail: AuditTrail[]) => void
) {
  eventBus.on('agent.log', (log: AgentLog) => {
    console.log(`[Synapse] Connection fired (Incoming): Agent System emitted log from ${log.agent}`);

    if (log.type === 'action' || log.type === 'success') {
      const currentTrail = getAuditTrail();
      const nextTrail = createAuditLog(
        currentTrail,
        `AGENT_${log.type.toUpperCase()}`,
        log.message,
        `System Agent: ${log.agent}`
      );
      setAuditTrail(nextTrail);

      const newLog = nextTrail[nextTrail.length - 1];
      console.log(`[Synapse] Connection fired (Outgoing): Audit System updated with hash ${newLog.hash}`);
      eventBus.emit('audit.updated', newLog);
    }
  });
}
