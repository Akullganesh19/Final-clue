import { eventBus } from './EventBus';
import { createAuditLog } from '../utils/audit';
import { AuditTrail, AgentLog } from '../types';

// Internal state to hold audit logs (acting as our disconnected database for this scope)
let auditLogsState: AuditTrail[] = [];

// Expose getter and setter for testing
export const getAuditLogs = () => auditLogsState;
export const setAuditLogs = (logs: AuditTrail[]) => {
  auditLogsState = logs;
};

// Map agent events to audit logs
// We bridge the Agent System (which emits agent.action events)
// with the Audit System (which manages the immutable AuditTrail array)

eventBus.on('agent.action', (agentLog: AgentLog) => {
  if (!agentLog) {
    console.warn('agentAuditBridge: Received agent.action with missing data');
    return;
  }

  const { id, agent, message, type } = agentLog;

  if (!agent || !message) {
    console.warn('agentAuditBridge: Missing required agent or message in payload');
    return;
  }

  // Generate an idempotency key to safely deduplicate retries
  const idempotencyKey = id || `AUTO-${Date.now()}`;

  const actionName = `${agent.toUpperCase()}_ACTION`;
  const details = `${type.toUpperCase()}: ${message} (Idempotency: ${idempotencyKey})`;

  console.log(`[Synapse Bridge] 🧠 -> 🧾 Flowing Agent Action to Audit Log: ${actionName}`);

  // Update the internal state with the new log
  auditLogsState = createAuditLog(
    auditLogsState,
    actionName,
    details,
    `System Agent (${agent})`
  );

  console.log(`[Synapse Bridge] 🧾 <- 🧠 Audit Log created successfully. Total logs: ${auditLogsState.length}`);
});

export const _agentAuditBridgeLoaded = true;
