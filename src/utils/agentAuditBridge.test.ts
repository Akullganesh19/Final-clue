import test from 'node:test';
import assert from 'node:assert/strict';
import { eventBus } from './events.js';
import { setupAgentAuditBridge, getGlobalAuditLogs, resetGlobalAuditLogs } from './agentAuditBridge.js';
import { AgentLog } from '../types.js';

test('Agent Logs to Audit Trail Bridge', (t) => {
  // Setup
  eventBus.clear();
  resetGlobalAuditLogs();
  setupAgentAuditBridge();

  // Test data
  const actionLog: AgentLog = {
    id: '123',
    agent: 'Planner',
    message: 'Created execution plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  const infoLog: AgentLog = {
    id: '124',
    agent: 'Retrieval',
    message: 'Found 3 documents',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  // Action
  eventBus.emit('agent.action', actionLog);
  eventBus.emit('agent.action', infoLog); // Should not be logged as it's not an 'action' type

  // Verification
  const logs = getGlobalAuditLogs();

  assert.equal(logs.length, 1, 'Only one action should be logged');

  const auditLog = logs[0];
  assert.equal(auditLog.action, 'AGENT_ACTION');
  assert.equal(auditLog.details, 'Agent Planner performed action: Created execution plan');
  assert.equal(auditLog.author, 'System (Planner)');
  assert.ok(auditLog.hash.startsWith('CHK-'), 'Audit hash should be generated');

  // Teardown
  eventBus.clear();
  resetGlobalAuditLogs();
});
