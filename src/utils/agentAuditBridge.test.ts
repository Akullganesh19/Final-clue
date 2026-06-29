import test from 'node:test';
import assert from 'node:assert';
import { eventBus } from './eventBus';
import { setupAgentAuditBridge } from './agentAuditBridge';
import { AuditTrail, AgentLog } from '../types';

test('setupAgentAuditBridge - appends logs for significant agent actions', (t) => {
  // Clear any existing listeners to ensure a clean state
  eventBus.clear();

  let stateUpdated = false;
  let newLogs: AuditTrail[] = [];

  const mockSetLogs = (updater: any) => {
    stateUpdated = true;
    const prevLogs: AuditTrail[] = [];
    newLogs = updater(prevLogs);
  };

  const unsubscribe = setupAgentAuditBridge(mockSetLogs as any);

  const significantLog: AgentLog = {
    id: '123',
    agent: 'Planner',
    message: 'Generated plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.action', significantLog);

  assert.strictEqual(stateUpdated, true, 'setLogs should have been called');
  assert.strictEqual(newLogs.length, 1, 'One log should have been appended');
  assert.strictEqual(newLogs[0].action, 'AGENT_ACTION', 'Log action should be AGENT_ACTION');
  assert.strictEqual(newLogs[0].details, '[Planner] Generated plan', 'Log details should match');
  assert.strictEqual(newLogs[0].author, 'System Agent', 'Log author should be System Agent');

  unsubscribe();
});

test('setupAgentAuditBridge - ignores info type agent logs', (t) => {
  // Clear any existing listeners to ensure a clean state
  eventBus.clear();

  let stateUpdated = false;

  const mockSetLogs = (updater: any) => {
    stateUpdated = true;
  };

  const unsubscribe = setupAgentAuditBridge(mockSetLogs as any);

  const infoLog: AgentLog = {
    id: '456',
    agent: 'Retrieval',
    message: 'Searching for evidence',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  eventBus.emit('agent.action', infoLog);

  assert.strictEqual(stateUpdated, false, 'setLogs should NOT have been called for type info');

  unsubscribe();
});
