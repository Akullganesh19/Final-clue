import { eventBus } from './eventBus';
import { createAuditLog } from './audit';
import { AgentLog, AuditTrail } from '../types';

let currentAuditLogs: AuditTrail[] = [];

export function setupAuditBridge() {
  eventBus.on('agent.log_created', (data: unknown) => {
    const log = data as AgentLog;

    // Log connection firing: System A -> Bridge
    console.log(`[Synapse Connection] Received agent.log_created event from ${log.agent}`);

    if (log.type === 'action' || log.type === 'warn') {
      currentAuditLogs = createAuditLog(
        currentAuditLogs,
        'AGENT_ACTION_' + log.agent.toUpperCase(),
        'Autonomous agent action: ' + log.message,
        'System Agent: ' + log.agent
      );

      // Log connection firing: Bridge -> System B
      console.log(`[Synapse Connection] Emitting audit.trail_updated event with ${currentAuditLogs.length} logs`);
      eventBus.emit('audit.trail_updated', currentAuditLogs);
    }
  });
}

export function getCurrentAuditLogs(): AuditTrail[] {
  return currentAuditLogs;
}

export function resetAuditLogsForTesting() {
  currentAuditLogs = [];
}
