import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './eventBus';
import { setupAgentAuditBridge } from './agentAuditBridge';
import { AgentLog, AuditTrail } from '../types';

describe('Agent Audit Bridge', () => {
  let auditLogs: AuditTrail[] = [];

  beforeEach(() => {
    auditLogs = [];
    eventBus.clear();
  });

  const updateLogs = (updater: (logs: AuditTrail[]) => AuditTrail[]) => {
    auditLogs = updater(auditLogs);
  };

  it('should route agent.action events into audit logs', () => {
    const removeBridge = setupAgentAuditBridge(updateLogs);

    const agentLog: AgentLog = {
      id: 'log-1',
      agent: 'Retrieval',
      message: 'Found matching semantic records.',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    eventBus.emit('agent.action', agentLog);

    assert.strictEqual(auditLogs.length, 1);

    const latestLog = auditLogs[0];
    assert.strictEqual(latestLog.action, 'AGENT_ACTION_RETRIEVAL');
    assert.strictEqual(latestLog.details, 'Found matching semantic records.');
    assert.strictEqual(latestLog.author, 'System Agent: Retrieval');
    assert.ok(latestLog.hash.startsWith('CHK-'));

    removeBridge();
  });

  it('should not add logs if bridge is removed', () => {
    const removeBridge = setupAgentAuditBridge(updateLogs);

    removeBridge();

    const agentLog: AgentLog = {
      id: 'log-2',
      agent: 'Planner',
      message: 'Created execution plan.',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    eventBus.emit('agent.action', agentLog);

    assert.strictEqual(auditLogs.length, 0);
  });
});
