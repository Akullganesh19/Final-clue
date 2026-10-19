import { test } from 'node:test';
import * as assert from 'node:assert';
import { eventBus, bridgeAgentToAudit } from './events';
import { AgentLog, AuditTrail } from '../types';

test('EventBus should allow subscribing and emitting events', () => {
  let receivedData: any = null;
  const callback = (data: any) => { receivedData = data; };

  eventBus.on('test.event', callback);
  eventBus.emit('test.event', { message: 'hello' });

  assert.deepStrictEqual(receivedData, { message: 'hello' });

  // Clean up
  eventBus.off('test.event', callback);
});

test('bridgeAgentToAudit should bridge action AgentLog to AuditTrail', () => {
  let updateCalledCount = 0;
  let newLog: AuditTrail | null = null;

  const mockUpdateAuditLogs = (updater: (logs: AuditTrail[]) => AuditTrail[]) => {
    updateCalledCount++;
    const prevLogs: AuditTrail[] = [{
      id: 'mock-1',
      timestamp: new Date().toISOString(),
      action: 'MOCK_START',
      details: 'Mock start',
      author: 'System',
      hash: 'CHK-MOCK'
    }];
    const updated = updater(prevLogs);
    newLog = updated[updated.length - 1];
  };

  bridgeAgentToAudit(mockUpdateAuditLogs);

  const mockAgentLog: AgentLog = {
    id: 'agent-log-1',
    agent: 'Planner',
    message: 'Planned the operation',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.log', mockAgentLog);

  assert.strictEqual(updateCalledCount, 1);
  assert.ok(newLog !== null);
  assert.strictEqual(newLog!.action, 'AGENT_PLANNER_ACTION');
  assert.strictEqual(newLog!.details, 'Planned the operation');
  assert.strictEqual(newLog!.author, 'Agent: Planner');
  assert.ok(newLog!.hash.startsWith('CHK-'));
});

test('bridgeAgentToAudit should ignore info AgentLog', () => {
  let updateCalledCount = 0;

  const mockUpdateAuditLogs = (updater: (logs: AuditTrail[]) => AuditTrail[]) => {
    updateCalledCount++;
  };

  // The listener is already attached from the previous test, but we can emit directly
  const mockAgentLog: AgentLog = {
    id: 'agent-log-2',
    agent: 'Retrieval',
    message: 'Retrieved data',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  eventBus.emit('agent.log', mockAgentLog);

  assert.strictEqual(updateCalledCount, 0, 'Should not update audit logs for info events');
});
