import test from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events';
import { setupAgentAuditBridge, globalAuditLogs, _resetGlobalAuditLogs } from './bridge';
import { AgentLog } from '../types';

test('Agent Audit Bridge', async (t) => {
  await t.test('should append an audit log when agent.action is emitted', () => {
    // Setup
    eventBus.clear();
    _resetGlobalAuditLogs();
    setupAgentAuditBridge();

    // Initial state check
    assert.strictEqual(globalAuditLogs.length, 0);

    // Mock agent log
    const agentLog: AgentLog = {
      id: 'log-1',
      agent: 'Planner',
      message: 'Created a plan',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    // Emit event
    eventBus.emit('agent.action', agentLog);

    // Assert
    assert.strictEqual(globalAuditLogs.length, 1);
    const newLog = globalAuditLogs[0];
    assert.strictEqual(newLog.action, 'Planner Agent Activity');
    assert.strictEqual(newLog.details, 'Created a plan');
    assert.strictEqual(newLog.author, 'System Agent: Planner');
    assert.ok(newLog.hash.startsWith('CHK-')); // Confirm hash generation occurred
  });
});