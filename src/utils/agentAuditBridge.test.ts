import { describe, it, mock } from 'node:test';
import * as assert from 'node:assert';
import { eventBus } from './eventBus';
import { setupAgentAuditBridge } from './agentAuditBridge';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

describe('Agent <-> Audit Bridge', () => {
  it('bridges agent action events to the audit ledger via state updater', () => {
    let capturedUpdater: ((logs: AuditTrail[]) => AuditTrail[]) | undefined;

    // Mock the React setLogs dispatcher
    const setAuditLogs = (updater: (logs: AuditTrail[]) => AuditTrail[]) => {
      capturedUpdater = updater;
    };

    // Setup the bridge
    const cleanup = setupAgentAuditBridge(setAuditLogs);

    // Initial dummy state
    const initialLogs: AuditTrail[] = [{
      id: 'test-1',
      timestamp: '2023-01-01',
      action: 'INIT',
      details: 'Start',
      author: 'System',
      hash: 'CHK-123'
    }];

    // Emit an agent event of type 'info' - shouldn't trigger update
    const infoLog: AgentLog = {
      id: 'log-1',
      agent: 'Planner',
      message: 'Planning started',
      timestamp: '2023-01-01',
      type: 'info'
    };
    eventBus.emit('agent.log', infoLog);
    assert.strictEqual(capturedUpdater, undefined, "Should not update for 'info' logs");

    // Emit an agent event of type 'action' - should trigger update
    const actionLog: AgentLog = {
      id: 'log-2',
      agent: 'Retrieval',
      message: 'Fetched missing documents',
      timestamp: '2023-01-01',
      type: 'action'
    };
    eventBus.emit('agent.log', actionLog);
    assert.notStrictEqual(capturedUpdater, undefined, "Should update for 'action' logs");

    // Execute the captured updater to simulate React applying state
    if (capturedUpdater) {
      const newLogs = capturedUpdater(initialLogs);

      // Verify new state
      assert.strictEqual(newLogs.length, 2);

      const newLog = newLogs[1];
      assert.strictEqual(newLog.action, 'AGENT_ACTION_RETRIEVAL');
      assert.strictEqual(newLog.details, 'Fetched missing documents');
      assert.strictEqual(newLog.author, 'Agent: Retrieval');
      assert.ok(newLog.hash.startsWith('CHK-'));
    }

    cleanup();
  });
});
