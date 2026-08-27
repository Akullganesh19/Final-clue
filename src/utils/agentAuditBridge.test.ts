import { test } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './eventBus.js';
import { initAgentAuditBridge } from './agentAuditBridge.js';
import { AgentLog, AuditTrail } from '../types.js';

test('Agent-Audit Bridge connects Agent logs to Audit System', () => {
  let currentTrail: AuditTrail[] = [];
  let updateCount = 0;

  initAgentAuditBridge(
    () => currentTrail,
    (newTrail) => {
      currentTrail = newTrail;
      updateCount++;
    }
  );

  const testLog: AgentLog = {
    id: 'test-log-1',
    agent: 'Planner',
    message: 'Generated case linkage plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.log', testLog);

  assert.strictEqual(updateCount, 1);
  assert.strictEqual(currentTrail.length, 1);
  assert.strictEqual(currentTrail[0].action, 'AGENT_ACTION');
  assert.strictEqual(currentTrail[0].author, 'System Agent: Planner');

  const infoLog: AgentLog = {
    ...testLog,
    id: 'test-log-2',
    type: 'info'
  };

  eventBus.emit('agent.log', infoLog);
  assert.strictEqual(updateCount, 1, 'Info logs should not trigger audit updates');
});
