import test from 'node:test';
import assert from 'node:assert';
import { eventBus } from './EventBus';
import { getAuditLogs, setAuditLogs } from './agentAuditBridge';
import { AgentLog } from '../types';

test('agentAuditBridge maps agent.action to audit log correctly', () => {
  // Setup
  setAuditLogs([]);

  const mockAgentLog: AgentLog = {
    id: 'TEST-AGENT-123',
    agent: 'Planner',
    message: 'Analyzing case linkage...',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  // Execute: Emit the event, just as the disconnected Agent System would
  eventBus.emit('agent.action', mockAgentLog);

  // Assert
  const logs = getAuditLogs();
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].action, 'PLANNER_ACTION');
  assert.ok(logs[0].details.includes('ACTION: Analyzing case linkage...'));
  assert.ok(logs[0].details.includes('TEST-AGENT-123')); // idempotencyKey check
  assert.strictEqual(logs[0].author, 'System Agent (Planner)');
  assert.ok(logs[0].hash.startsWith('CHK-')); // Confirm audit trail works
});

test('agentAuditBridge handles missing payload gracefully', () => {
  // Setup
  setAuditLogs([]);

  // Execute
  eventBus.emit('agent.action', null);

  // Assert
  const logs = getAuditLogs();
  assert.strictEqual(logs.length, 0); // Should not have created a log
});

test('agentAuditBridge handles missing fields gracefully', () => {
  // Setup
  setAuditLogs([]);

  // Execute
  eventBus.emit('agent.action', { id: 'TEST' });

  // Assert
  const logs = getAuditLogs();
  assert.strictEqual(logs.length, 0); // Should not have created a log
});
