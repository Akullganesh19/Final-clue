import { test } from 'node:test';
import * as assert from 'node:assert';
import { eventBus } from './events';
import { initializeAgentAuditBridge } from './agentAuditBridge';
import { AgentLog, AuditTrail } from '../types';

test('agentAuditBridge integrates agent logs with audit trails loosely', (t) => {
  // Clear any previous listeners
  eventBus.clear();

  let currentLogs: AuditTrail[] = [];
  const getInitialLogs = () => currentLogs;

  // Initialize the bridge
  initializeAgentAuditBridge(getInitialLogs);

  let updatedLogs: AuditTrail[] | null = null;
  eventBus.on('audit.updated', (logs: AuditTrail[]) => {
    updatedLogs = logs;
    currentLogs = logs;
  });

  // Test 1: Action log triggers audit trail update
  const actionLog: AgentLog = {
    id: 'L1',
    agent: 'Planner',
    message: 'Planned next actions',
    timestamp: new Date().toISOString(),
    type: 'action'
  };
  eventBus.emit('agent.log', actionLog);

  assert.ok(updatedLogs !== null, 'audit.updated should have been emitted');
  assert.strictEqual(updatedLogs!.length, 1, 'One audit log should be created');
  assert.strictEqual(updatedLogs![0].action, 'AGENT_ACTION');
  assert.strictEqual(updatedLogs![0].details, 'Planner: Planned next actions');

  // Reset for next test
  updatedLogs = null;

  // Test 2: Info log does not trigger audit trail update
  const infoLog: AgentLog = {
    id: 'L2',
    agent: 'Retrieval',
    message: 'Found 3 documents',
    timestamp: new Date().toISOString(),
    type: 'info'
  };
  eventBus.emit('agent.log', infoLog);

  assert.strictEqual(updatedLogs, null, 'Info log should not trigger audit update');
  assert.strictEqual(currentLogs.length, 1, 'Audit log length should remain 1');

  // Test 3: Warn log triggers audit trail update
  const warnLog: AgentLog = {
    id: 'L3',
    agent: 'Critic',
    message: 'Low confidence score',
    timestamp: new Date().toISOString(),
    type: 'warn'
  };
  eventBus.emit('agent.log', warnLog);

  assert.ok(updatedLogs !== null, 'Warn log should trigger audit update');
  assert.strictEqual(updatedLogs!.length, 2, 'Total audit logs should be 2');
  assert.strictEqual(updatedLogs![1].action, 'AGENT_WARN');
  assert.strictEqual(updatedLogs![1].details, 'Critic: Low confidence score');
});
