import { test, mock } from 'node:test';
import assert from 'node:assert';
import { setupAgentAuditBridge } from './agentAuditBridge';
import { eventBus } from './eventBus';
import { AgentLog, AuditTrail } from '../types';

test('setupAgentAuditBridge cross-system connection', async (t) => {
  await t.test('it listens to agent.action events and updates the audit log', () => {
    // 1. Mock the React state setter
    let capturedUpdater: ((prevLogs: AuditTrail[]) => AuditTrail[]) | null = null;
    const mockSetAuditLogs = mock.fn((updater: any) => {
      capturedUpdater = updater;
    });

    // 2. Setup the bridge
    const unsubscribe = setupAgentAuditBridge(mockSetAuditLogs as any);

    // 3. Emit an agent action event (System A)
    const agentAction: AgentLog = {
      id: 'log-1',
      agent: 'Planner',
      message: 'Generated execution plan for case linkage',
      type: 'action',
      timestamp: new Date().toISOString()
    };
    eventBus.emit('agent.action', agentAction);

    // 4. Verify the bridge intercepted and called the state setter (System B)
    assert.strictEqual(mockSetAuditLogs.mock.calls.length, 1);
    assert.ok(capturedUpdater !== null);

    // 5. Verify the updater correctly applies the change
    const prevLogs: AuditTrail[] = [];
    const newLogs = capturedUpdater!(prevLogs);

    assert.strictEqual(newLogs.length, 1);
    assert.strictEqual(newLogs[0].action, '[AGENT:PLANNER]');
    assert.strictEqual(newLogs[0].details, 'Generated execution plan for case linkage');
    assert.strictEqual(newLogs[0].author, 'System Agent: Planner');
    assert.ok(newLogs[0].hash.startsWith('CHK-'));

    // Cleanup
    unsubscribe();
  });

  await t.test('it ignores info logs', () => {
    const mockSetAuditLogs = mock.fn();
    const unsubscribe = setupAgentAuditBridge(mockSetAuditLogs as any);

    const infoLog: AgentLog = {
      id: 'log-2',
      agent: 'Retrieval',
      message: 'Found 3 related cases',
      type: 'info',
      timestamp: new Date().toISOString()
    };
    eventBus.emit('agent.action', infoLog);

    assert.strictEqual(mockSetAuditLogs.mock.calls.length, 0);

    unsubscribe();
  });
});
