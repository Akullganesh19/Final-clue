import { test } from 'node:test';
import * as assert from 'node:assert';
import { setupAgentAuditBridge } from './agentAuditBridge';
import { eventBus } from './events';
import { AuditTrail, AgentLog } from '../types';

test('AgentAuditBridge maps agent.log action to AuditTrail', () => {
  let currentLogs: AuditTrail[] = [];

  // Set up the bridge
  setupAgentAuditBridge(
    () => currentLogs,
    (newLogs) => {
      currentLogs = newLogs;
    }
  );

  // Emit a non-action log (should be ignored)
  const infoLog: AgentLog = {
    id: '1',
    agent: 'Planner',
    message: 'Planning started',
    timestamp: new Date().toISOString(),
    type: 'info'
  };
  eventBus.emit('agent.log', infoLog);
  assert.strictEqual(currentLogs.length, 0, 'Info logs should not be bridged');

  // Emit an action log (should be bridged)
  const actionLog: AgentLog = {
    id: '2',
    agent: 'Retrieval',
    message: 'Fetched data from DB',
    timestamp: new Date().toISOString(),
    type: 'action'
  };
  eventBus.emit('agent.log', actionLog);
  assert.strictEqual(currentLogs.length, 1, 'Action logs should be bridged');
  assert.strictEqual(currentLogs[0].action, 'Agent Action: Retrieval');
  assert.strictEqual(currentLogs[0].details, 'Fetched data from DB');
  assert.strictEqual(currentLogs[0].author, 'System: Retrieval');
});
