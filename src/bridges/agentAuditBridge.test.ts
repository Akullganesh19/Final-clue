import test from 'node:test';
import assert from 'node:assert';
import { eventBus } from '../utils/eventBus';
import { getAuditLogs } from './agentAuditBridge';
import { AgentLog } from '../types';

test('agent.action event is bridged to AuditTrail', () => {
  const initialLogs = getAuditLogs();
  const initialLength = initialLogs.length;

  const mockAgentLog: AgentLog = {
    id: 'test-log-1',
    agent: 'Planner',
    message: 'Test agent action executed',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.action', mockAgentLog);

  const updatedLogs = getAuditLogs();
  assert.strictEqual(updatedLogs.length, initialLength + 1);

  const latestLog = updatedLogs[updatedLogs.length - 1];
  assert.strictEqual(latestLog.author, 'Planner');
  assert.strictEqual(latestLog.action, 'Agent Action Executed');
  assert.strictEqual(latestLog.details, 'Test agent action executed');
});
