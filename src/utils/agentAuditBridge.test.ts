import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events.ts';
import { setupAgentAuditBridge } from './agentAuditBridge.ts';
import { AuditTrail, AgentLog } from '../types.ts';

test('Agent Audit Bridge', async (t) => {
  await t.test('should append to audit log for action events', () => {
    eventBus.clear();
    let currentLogs: AuditTrail[] = [];

    setupAgentAuditBridge(
      () => currentLogs,
      (newLogs) => {
        currentLogs = newLogs;
      }
    );

    const logAction: AgentLog = {
      id: 'test-1',
      agent: 'Planner',
      message: 'Created a new investigation plan',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    eventBus.emit('agent.log', logAction);

    assert.strictEqual(currentLogs.length, 1);
    assert.strictEqual(currentLogs[0].action, 'Agent Planner Action');
    assert.strictEqual(currentLogs[0].details, 'Created a new investigation plan');
    assert.strictEqual(currentLogs[0].author, 'Agent (Planner)');
  });

  await t.test('should append to audit log for success events', () => {
    eventBus.clear();
    let currentLogs: AuditTrail[] = [];

    setupAgentAuditBridge(
      () => currentLogs,
      (newLogs) => {
        currentLogs = newLogs;
      }
    );

    const logSuccess: AgentLog = {
      id: 'test-2',
      agent: 'Evidence',
      message: 'Successfully analyzed evidence',
      timestamp: new Date().toISOString(),
      type: 'success'
    };

    eventBus.emit('agent.log', logSuccess);

    assert.strictEqual(currentLogs.length, 1);
    assert.strictEqual(currentLogs[0].action, 'Agent Evidence Action');
    assert.strictEqual(currentLogs[0].details, 'Successfully analyzed evidence');
    assert.strictEqual(currentLogs[0].author, 'Agent (Evidence)');
  });

  await t.test('should not append to audit log for info events', () => {
    eventBus.clear();
    let currentLogs: AuditTrail[] = [];

    setupAgentAuditBridge(
      () => currentLogs,
      (newLogs) => {
        currentLogs = newLogs;
      }
    );

    const logInfo: AgentLog = {
      id: 'test-3',
      agent: 'Retrieval',
      message: 'Searching for cases',
      timestamp: new Date().toISOString(),
      type: 'info'
    };

    eventBus.emit('agent.log', logInfo);

    assert.strictEqual(currentLogs.length, 0);
  });
});
