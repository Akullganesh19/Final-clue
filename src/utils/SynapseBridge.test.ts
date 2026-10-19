import test from 'node:test';
import assert from 'node:assert';
import { EventBus } from './EventBus';
import { initSynapseBridge, getBridgedAuditLogs } from './SynapseBridge';
import { AgentLog } from '../types';

test('SynapseBridge - connects Agent system to Audit system', (t) => {
  // Clear any existing state
  EventBus.clear();
  initSynapseBridge([]);

  // Initially empty
  assert.strictEqual(getBridgedAuditLogs().length, 0);

  // Emit a mock agent.action event
  const mockAgentLog: AgentLog = {
    id: 'test-log-1',
    agent: 'Planner',
    message: 'Generated case resolution plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  EventBus.emit('agent.action', mockAgentLog);

  // Assert log is created
  const logs = getBridgedAuditLogs();
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].action, 'AGENT_PLANNER_ACTION');
  assert.strictEqual(logs[0].details, 'Generated case resolution plan');
  assert.strictEqual(logs[0].idempotencyKey, 'synapse-agent-log-test-log-1');
  assert.strictEqual(logs[0].author, 'Agent: Planner');

  // Test idempotency
  EventBus.emit('agent.action', mockAgentLog);
  const logsAfterIdempotentCall = getBridgedAuditLogs();
  assert.strictEqual(logsAfterIdempotentCall.length, 1, 'Idempotency guard failed to prevent duplicate logs');

  // Test ignore info logs
  const mockInfoLog: AgentLog = {
    id: 'test-log-2',
    agent: 'Critic',
    message: 'Reviewing plan...',
    timestamp: new Date().toISOString(),
    type: 'info'
  };
  EventBus.emit('agent.action', mockInfoLog);

  const logsAfterInfoCall = getBridgedAuditLogs();
  assert.strictEqual(logsAfterInfoCall.length, 1, 'Bridge should ignore info logs');
});
