import test from 'node:test';
import assert from 'node:assert';
import { setupAuditBridge, getCurrentAuditLogs, resetAuditLogsForTesting } from './auditBridge';
import { eventBus } from './eventBus';
import { AgentLog } from '../types';

test('Audit Bridge automatically logs critical agent actions', () => {
  resetAuditLogsForTesting();
  setupAuditBridge();

  const infoLog: AgentLog = { id: '1', agent: 'Retrieval', type: 'info', message: 'Fetched docs', timestamp: '2024-01-01' };
  eventBus.emit('agent.log_created', infoLog);
  assert.strictEqual(getCurrentAuditLogs().length, 0);

  const actionLog: AgentLog = { id: '2', agent: 'Planner', type: 'action', message: 'Generated summary', timestamp: '2024-01-01' };
  eventBus.emit('agent.log_created', actionLog);
  const auditLogs = getCurrentAuditLogs();
  assert.strictEqual(auditLogs.length, 1);

  const auditLog = auditLogs[0];
  assert.strictEqual(auditLog.action, 'AGENT_ACTION_PLANNER');
  assert.strictEqual(auditLog.details, 'Autonomous agent action: Generated summary');
  assert.strictEqual(auditLog.author, 'System Agent: Planner');
});
