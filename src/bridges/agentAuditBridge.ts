import { eventBus } from '../utils/eventBus';
import { createAuditLog } from '../utils/audit';
import { AgentLog, AuditTrail } from '../types';

let internalLogs: AuditTrail[] = [];

export const getAuditLogs = () => internalLogs;

eventBus.on('agent.action', (payload: AgentLog) => {
  console.log('🧠 Synapse: agent.action bridged to AuditTrail', payload);
  internalLogs = createAuditLog(
    internalLogs,
    'Agent Action Executed',
    payload.message,
    payload.agent
  );
});
